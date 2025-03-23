// DOM Elements
const savingsGoalForm = document.getElementById("savings-goal-form")
const savingsGoalsList = document.getElementById("savings-goals-list")

// Global variables
let savingsGoals = JSON.parse(localStorage.getItem("savingsGoals")) || []

// Initialize
function initSavingsGoals() {
  // Set default goal date to 6 months from now
  const defaultDate = new Date()
  defaultDate.setMonth(defaultDate.getMonth() + 6)
  document.getElementById("goal-date").valueAsDate = defaultDate

  // Event listeners
  savingsGoalForm.addEventListener("submit", addSavingsGoal)

  // Render existing goals
  renderSavingsGoals()

  // Update goals progress periodically
  setInterval(updateGoalsProgress, 60000) // Update every minute
}

// Add a new savings goal
function addSavingsGoal(e) {
  e.preventDefault()

  const name = document.getElementById("goal-name").value
  const amount = Number.parseFloat(document.getElementById("goal-amount").value)
  const dateStr = document.getElementById("goal-date").value
  const initial = Number.parseFloat(document.getElementById("goal-initial").value) || 0
  const notes = document.getElementById("goal-notes").value

  if (!name || isNaN(amount) || !dateStr || amount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  // Fix date timezone issue by parsing parts manually
  const [year, month, day] = dateStr.split("-").map(Number)
  const targetDate = new Date(year, month - 1, day)

  const goal = {
    id: Date.now().toString(),
    name,
    targetAmount: amount,
    currentAmount: initial,
    targetDate: targetDate.toISOString().split("T")[0],
    notes,
    createdAt: new Date().toISOString(),
    contributions:
      initial > 0
        ? [
            {
              amount: initial,
              date: new Date().toISOString(),
              notes: "Monto inicial",
            },
          ]
        : [],
  }

  savingsGoals.push(goal)
  saveSavingsGoals()
  renderSavingsGoals()

  // Show success message
  showSuccessModal("Meta Creada", `La meta de ahorro "${name}" ha sido creada correctamente.`)

  // Reset form
  savingsGoalForm.reset()
  const defaultDate = new Date()
  defaultDate.setMonth(defaultDate.getMonth() + 6)
  document.getElementById("goal-date").valueAsDate = defaultDate
}

// Save savings goals to localStorage
function saveSavingsGoals() {
  localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals))
}

// Render savings goals
function renderSavingsGoals() {
  if (!savingsGoalsList) return

  savingsGoalsList.innerHTML = ""

  if (savingsGoals.length === 0) {
    savingsGoalsList.innerHTML = '<p class="no-goals">No hay metas de ahorro registradas.</p>'
    return
  }

  // Sort goals by completion percentage (least complete first)
  savingsGoals.sort((a, b) => {
    const percentA = (a.currentAmount / a.targetAmount) * 100
    const percentB = (b.currentAmount / b.targetAmount) * 100
    return percentA - percentB
  })

  savingsGoals.forEach((goal) => {
    const percentComplete = (goal.currentAmount / goal.targetAmount) * 100
    const daysLeft = getDaysLeft(goal.targetDate)
    const targetDate = new Date(goal.targetDate)

    const goalCard = document.createElement("div")
    goalCard.className = "goal-card"

    // Determine status class based on progress and time left
    let statusClass = "on-track"
    let statusText = "En camino"

    if (percentComplete >= 100) {
      statusClass = "completed"
      statusText = "¡Completado!"
    } else if (daysLeft < 0) {
      statusClass = "overdue"
      statusText = "Fecha vencida"
    } else if (percentComplete < 100 - (daysLeft / 30) * 10) {
      // If progress is less than expected based on time left
      statusClass = "behind"
      statusText = "Atrasado"
    }

    goalCard.innerHTML = `
      <div class="goal-header ${statusClass}">
        <div class="goal-title">${goal.name}</div>
        <div class="goal-status">${statusText}</div>
      </div>
      
      <div class="goal-body">
        <div class="goal-progress-container">
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${Math.min(100, percentComplete)}%"></div>
          </div>
          <div class="goal-progress-text">${percentComplete.toFixed(1)}% completado</div>
        </div>
        
        <div class="goal-details">
          <div class="goal-amount">
            <span>$${formatCurrency(goal.currentAmount)}</span> de <span>$${formatCurrency(goal.targetAmount)}</span>
          </div>
          <div class="goal-date">
            Fecha objetivo: ${targetDate.toLocaleDateString()}
            ${daysLeft > 0 ? `(${daysLeft} días restantes)` : ""}
          </div>
        </div>
        
        <div class="goal-actions">
          <button class="btn-primary add-contribution-btn" onclick="openContributionModal('${goal.id}')">
            Agregar Contribución
          </button>
          <button class="btn-secondary goal-details-btn" onclick="toggleGoalDetails('${goal.id}')">
            Ver Detalles
          </button>
          <button class="btn-danger delete-goal-btn" onclick="confirmDeleteGoal('${goal.id}')">
            Eliminar
          </button>
        </div>
        
        <div class="goal-details-container" id="goal-details-${goal.id}">
          <h4>Historial de Contribuciones</h4>
          ${renderContributions(goal.contributions)}
          ${goal.notes ? `<div class="goal-notes"><strong>Notas:</strong> ${goal.notes}</div>` : ""}
        </div>
      </div>
    `

    savingsGoalsList.appendChild(goalCard)
  })
}

// Render contributions history
function renderContributions(contributions) {
  if (!contributions || contributions.length === 0) {
    return "<p>No hay contribuciones registradas.</p>"
  }

  let html = '<div class="contributions-list">'

  // Sort contributions by date (newest first)
  const sortedContributions = [...contributions].sort((a, b) => new Date(b.date) - new Date(a.date))

  sortedContributions.forEach((contribution) => {
    const date = new Date(contribution.date)
    html += `
      <div class="contribution-item">
        <div class="contribution-date">${date.toLocaleDateString()}</div>
        <div class="contribution-amount">$${formatCurrency(contribution.amount)}</div>
        ${contribution.notes ? `<div class="contribution-notes">${contribution.notes}</div>` : ""}
      </div>
    `
  })

  html += "</div>"
  return html
}

// Toggle goal details visibility
function toggleGoalDetails(goalId) {
  const detailsContainer = document.getElementById(`goal-details-${goalId}`)
  if (detailsContainer) {
    detailsContainer.classList.toggle("show")
  }
}

// Open modal to add a contribution
function openContributionModal(goalId) {
  const goal = savingsGoals.find((g) => g.id === goalId)
  if (!goal) return

  // Create modal if it doesn't exist
  let modal = document.getElementById("contribution-modal")
  if (!modal) {
    modal = document.createElement("div")
    modal.id = "contribution-modal"
    modal.className = "modal"

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Agregar Contribución</h2>
        <div id="contribution-goal-details"></div>
        <form id="contribution-form">
          <div class="form-group">
            <label for="contribution-amount">Monto:</label>
            <input type="number" id="contribution-amount" min="1" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="contribution-notes">Notas (opcional):</label>
            <textarea id="contribution-notes" rows="2"></textarea>
          </div>
          <button type="submit" class="btn-primary">Guardar Contribución</button>
        </form>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    const closeBtn = modal.querySelector(".close-modal")
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })

    const form = document.getElementById("contribution-form")
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      addContribution()
    })
  }

  // Update modal content with goal details
  const goalDetails = document.getElementById("contribution-goal-details")
  goalDetails.innerHTML = `
    <div class="contribution-goal-info">
      <p><strong>Meta:</strong> ${goal.name}</p>
      <p><strong>Progreso actual:</strong> $${formatCurrency(goal.currentAmount)} de $${formatCurrency(goal.targetAmount)}</p>
      <p><strong>Falta:</strong> $${formatCurrency(goal.targetAmount - goal.currentAmount)}</p>
    </div>
  `

  // Store current goal ID
  modal.dataset.goalId = goalId

  // Reset form
  document.getElementById("contribution-amount").value = ""
  document.getElementById("contribution-notes").value = ""

  // Show modal
  modal.style.display = "block"
}

// Add a contribution to a goal
function addContribution() {
  const modal = document.getElementById("contribution-modal")
  const goalId = modal.dataset.goalId

  const amount = Number.parseFloat(document.getElementById("contribution-amount").value)
  const notes = document.getElementById("contribution-notes").value

  if (isNaN(amount) || amount <= 0) {
    alert("Por favor, ingrese un monto válido.")
    return
  }

  const goalIndex = savingsGoals.findIndex((g) => g.id === goalId)
  if (goalIndex === -1) return

  // Add contribution
  const contribution = {
    amount,
    date: new Date().toISOString(),
    notes,
  }

  savingsGoals[goalIndex].contributions.push(contribution)
  savingsGoals[goalIndex].currentAmount += amount

  saveSavingsGoals()
  renderSavingsGoals()

  // Close modal
  modal.style.display = "none"

  // Show success message
  showSuccessModal(
    "Contribución Agregada",
    `Has agregado $${formatCurrency(amount)} a tu meta "${savingsGoals[goalIndex].name}".`,
  )
}

// Confirm delete goal
function confirmDeleteGoal(goalId) {
  const goal = savingsGoals.find((g) => g.id === goalId)
  if (!goal) return

  // Create modal if it doesn't exist
  let modal = document.getElementById("delete-goal-modal")
  if (!modal) {
    modal = document.createElement("div")
    modal.id = "delete-goal-modal"
    modal.className = "modal"

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Confirmar Eliminación</h2>
        <div id="delete-goal-details"></div>
        <div class="modal-buttons">
          <button id="cancel-delete-goal" class="btn-secondary">Cancelar</button>
          <button id="confirm-delete-goal" class="btn-danger">Eliminar</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    const closeBtn = modal.querySelector(".close-modal")
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })

    document.getElementById("cancel-delete-goal").addEventListener("click", () => {
      modal.style.display = "none"
    })

    document.getElementById("confirm-delete-goal").addEventListener("click", () => {
      deleteGoal(modal.dataset.goalId)
      modal.style.display = "none"
    })
  }

  // Update modal content with goal details
  const deleteDetails = document.getElementById("delete-goal-details")
  deleteDetails.innerHTML = `
    <p>¿Estás seguro que deseas eliminar la meta de ahorro <span class="goal-name-highlight">${goal.name}</span>?</p>
    <p>Has ahorrado <strong>$${formatCurrency(goal.currentAmount)}</strong> de <strong>$${formatCurrency(goal.targetAmount)}</strong>.</p>
    <p>Esta acción no se puede deshacer.</p>
  `

  // Store current goal ID
  modal.dataset.goalId = goalId

  // Show modal
  modal.style.display = "block"
}

// Delete a goal
function deleteGoal(goalId) {
  const goal = savingsGoals.find((g) => g.id === goalId)
  if (!goal) return

  const goalName = goal.name

  // Remove goal
  savingsGoals = savingsGoals.filter((g) => g.id !== goalId)
  saveSavingsGoals()
  renderSavingsGoals()

  // Show success message
  showSuccessModal("Meta Eliminada", `La meta de ahorro "${goalName}" ha sido eliminada correctamente.`)
}

// Update goals progress
function updateGoalsProgress() {
  renderSavingsGoals()
}

// Get days left until target date
function getDaysLeft(targetDateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(targetDateStr)
  targetDate.setHours(0, 0, 0, 0)

  const timeDiff = targetDate - today
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

// Format currency
function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.")
}

// Make functions available globally
window.openContributionModal = openContributionModal
window.toggleGoalDetails = toggleGoalDetails
window.confirmDeleteGoal = confirmDeleteGoal

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize when the goals tab is clicked
  const tabButtons = document.querySelectorAll(".tab-button")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.dataset.tab === "goals") {
        initSavingsGoals()
      }
    })
  })
})

