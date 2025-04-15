// DOM Elements
const planningForm = document.getElementById("planning-form")
const incomeForm = document.getElementById("income-form")
const extraIncomeForm = document.getElementById("extra-income-form")
const planningPendingList = document.getElementById("planning-pending-list")
const planningCompletedList = document.getElementById("planning-completed-list")
const planningSummary = document.getElementById("planning-summary")
const incomeSummary = document.getElementById("income-summary")
const incomeHistoryList = document.getElementById("income-history-list")
const totalExpensesSummary = document.getElementById("total-expenses-summary")
const filterCategory = document.getElementById("filter-category")
const filterPriority = document.getElementById("filter-priority")
const applyFiltersBtn = document.getElementById("apply-filters")

// Delete modal elements
const deleteModal = document.getElementById("planning-delete-modal")
const closeDeleteModal = document.querySelector(".close-delete")
const deleteDetails = document.getElementById("planning-delete-details")
const confirmDelete = document.getElementById("planning-confirm-delete")
const cancelDelete = document.getElementById("planning-cancel-delete")

// Success modal elements
const successModal = document.getElementById("success-modal")
const closeSuccessModal = document.querySelector(".close-success")
const successTitle = document.getElementById("success-title")
const successMessage = document.getElementById("success-message")
const successOk = document.getElementById("success-ok")

// Global variables
let plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []
const monthlyIncomes = JSON.parse(localStorage.getItem("monthlyIncomes")) || []
let extraIncomes = JSON.parse(localStorage.getItem("extraIncomes")) || []
let currentExpenseToDelete = null
let currentExtraIncomeToDelete = null
const activeFilters = {
  category: "todos",
  priority: "todos",
}

// Format currency with thousand separators (using dots)
function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.")
}

// Format month (YYYY-MM) to readable format
function formatMonth(monthStr) {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
  return date.toLocaleString("default", { month: "long", year: "numeric" })
}

// Get current month in YYYY-MM format
function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

// Initialize the app
function init() {
  // Set default date to today
  document.getElementById("planning-date").valueAsDate = new Date()

  // Set default month to current month
  document.getElementById("income-month").value = getCurrentMonth()
  document.getElementById("extra-income-month").value = getCurrentMonth()

  // Initialize tabs
  initializeTabs()

  renderPlannedExpenses()
  updatePlanningSummary()
  updateIncomeSummary()
  updateTotalExpensesSummary()
  renderIncomeHistory()

  // Event listeners
  planningForm.addEventListener("submit", addPlannedExpense)
  incomeForm.addEventListener("submit", saveIncome)
  extraIncomeForm.addEventListener("submit", addExtraIncome)

  // Delete modal events
  closeDeleteModal.addEventListener("click", () => (deleteModal.style.display = "none"))
  confirmDelete.addEventListener("click", () => {
    if (currentExpenseToDelete) {
      deletePlannedExpense(currentExpenseToDelete)
      deleteModal.style.display = "none"
      currentExpenseToDelete = null
    } else if (currentExtraIncomeToDelete) {
      deleteExtraIncomeConfirmed(currentExtraIncomeToDelete)
      deleteModal.style.display = "none"
      currentExtraIncomeToDelete = null
    }
  })
  cancelDelete.addEventListener("click", () => {
    deleteModal.style.display = "none"
    currentExpenseToDelete = null
    currentExtraIncomeToDelete = null
  })

  // Success modal events
  closeSuccessModal.addEventListener("click", () => (successModal.style.display = "none"))
  successOk.addEventListener("click", () => (successModal.style.display = "none"))

  // Filter events
  applyFiltersBtn.addEventListener("click", applyFilters)

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      deleteModal.style.display = "none"
      currentExpenseToDelete = null
      currentExtraIncomeToDelete = null
    }
    if (e.target === successModal) {
      successModal.style.display = "none"
    }
  })

  // Check for tour continuation
  checkTourContinuation()

  // Añadir manejo para gastos recurrentes
  const recurringCheckbox = document.getElementById("recurring-expense")
  const recurringOptions = document.getElementById("recurring-options")

  if (recurringCheckbox && recurringOptions) {
    recurringCheckbox.addEventListener("change", function () {
      if (this.checked) {
        recurringOptions.classList.add("show")
      } else {
        recurringOptions.classList.remove("show")
      }
    })
  }
}

// Show success modal
function showSuccessModal(title, message) {
  successTitle.textContent = title
  successMessage.textContent = message
  successModal.style.display = "block"
}

// Save income
function saveIncome(e) {
  e.preventDefault()

  const month = document.getElementById("income-month").value
  const amount = Number.parseFloat(document.getElementById("monthly-income").value)
  const notes = document.getElementById("income-notes").value

  if (!month || isNaN(amount) || amount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  // Check if income for this month already exists
  const existingIndex = monthlyIncomes.findIndex((income) => income.month === month)

  if (existingIndex >= 0) {
    // Update existing income
    monthlyIncomes[existingIndex] = {
      ...monthlyIncomes[existingIndex],
      amount,
      notes,
      updatedAt: new Date().toISOString(),
    }
  } else {
    // Add new income
    const incomeEntry = {
      id: Date.now().toString(),
      month,
      amount,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    monthlyIncomes.push(incomeEntry)
  }

  saveMonthlyIncomes()

  updateIncomeSummary()
  updateTotalExpensesSummary()
  renderIncomeHistory()

  // Show success modal with continue tour button if we're in tour mode
  if (localStorage.getItem("tourInProgress") === "true") {
    showSuccessModalWithTourContinue(
      "Sueldo Guardado",
      `El sueldo de ${formatMonth(month)} ha sido guardado correctamente.`,
      "extra-income",
    )
  } else {
    // Regular success modal
    showSuccessModal("Sueldo Guardado", `El sueldo de ${formatMonth(month)} ha sido guardado correctamente.`)
  }

  // Reset form
  document.getElementById("income-notes").value = ""
}

// Add extra income
function addExtraIncome(e) {
  e.preventDefault()

  const month = document.getElementById("extra-income-month").value
  const description = document.getElementById("extra-income-description").value
  const amount = Number.parseFloat(document.getElementById("extra-income-amount").value)

  if (!month || !description || isNaN(amount) || amount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  const extraIncome = {
    id: Date.now().toString(),
    month,
    description,
    amount,
    createdAt: new Date().toISOString(),
  }

  extraIncomes.push(extraIncome)
  saveExtraIncomes()

  updateIncomeSummary()
  updateTotalExpensesSummary()
  renderIncomeHistory()

  // Show success modal with continue tour button if we're in tour mode
  if (localStorage.getItem("tourInProgress") === "true") {
    showSuccessModalWithTourContinue(
      "Ingreso Extra Agregado",
      `El ingreso extra "${description}" para ${formatMonth(month)} ha sido agregado correctamente.`,
      "planning",
    )
  } else {
    // Regular success modal
    showSuccessModal(
      "Ingreso Extra Agregado",
      `El ingreso extra "${description}" para ${formatMonth(month)} ha sido agregado correctamente.`,
    )
  }

  // Reset form
  document.getElementById("extra-income-description").value = ""
  document.getElementById("extra-income-amount").value = ""
}

// Save monthly incomes to localStorage
function saveMonthlyIncomes() {
  localStorage.setItem("monthlyIncomes", JSON.stringify(monthlyIncomes))
}

// Save extra incomes to localStorage
function saveExtraIncomes() {
  localStorage.setItem("extraIncomes", JSON.stringify(extraIncomes))
}

// Render income history
function renderIncomeHistory() {
  incomeHistoryList.innerHTML = ""

  if (monthlyIncomes.length === 0 && extraIncomes.length === 0) {
    incomeHistoryList.innerHTML = '<p class="no-expenses">No hay registros de ingresos.</p>'
    return
  }

  // Create a combined list of all incomes
  const allIncomes = [
    ...monthlyIncomes.map((income) => ({
      ...income,
      type: "monthly",
      date: income.updatedAt || income.createdAt,
    })),
    ...extraIncomes.map((income) => ({
      ...income,
      type: "extra",
      date: income.createdAt,
    })),
  ]

  // Sort by date (newest first) and then by month
  allIncomes.sort((a, b) => {
    // First sort by month (most recent month first)
    const monthA = a.month
    const monthB = b.month
    if (monthA !== monthB) {
      return monthB.localeCompare(monthA)
    }
    // Then sort by date (newest first)
    return new Date(b.date) - new Date(a.date)
  })

  // Group by month
  const incomesByMonth = {}

  allIncomes.forEach((income) => {
    if (!incomesByMonth[income.month]) {
      incomesByMonth[income.month] = {
        month: income.month,
        formattedMonth: formatMonth(income.month),
        incomes: [],
      }
    }
    incomesByMonth[income.month].incomes.push(income)
  })

  // Render each month
  Object.values(incomesByMonth).forEach((monthData) => {
    const monthContainer = document.createElement("div")
    monthContainer.className = "income-month-container"

    const monthHeader = document.createElement("div")
    monthHeader.className = "income-month-header"
    monthHeader.innerHTML = `
          <h4>${monthData.formattedMonth}</h4>
      `

    monthContainer.appendChild(monthHeader)

    // Calculate total for this month
    let monthlyBase = 0
    let monthlyExtras = 0

    // Render each income in this month
    monthData.incomes.forEach((income) => {
      const incomeItem = document.createElement("div")
      incomeItem.className = `income-history-item ${income.type === "monthly" ? "monthly-income" : "extra-income"}`

      const date = new Date(income.date)
      const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

      if (income.type === "monthly") {
        monthlyBase = income.amount
        incomeItem.innerHTML = `
                  <div class="income-history-date">${formattedDate}</div>
                  <div class="income-history-title">Sueldo Base</div>
                  <div class="income-history-amount">$${formatCurrency(income.amount)}</div>
                  ${income.notes ? `<div class="income-history-notes">${income.notes}</div>` : ""}
                  <button class="edit-income-btn" onclick="editMonthlyIncome('${income.month}')">Editar</button>
              `
      } else {
        monthlyExtras += income.amount
        incomeItem.innerHTML = `
                  <div class="income-history-date">${formattedDate}</div>
                  <div class="income-history-title">${income.description}</div>
                  <div class="income-history-amount extra">+$${formatCurrency(income.amount)}</div>
                  <button class="delete-income-btn" onclick="confirmDeleteExtraIncome('${income.id}')">Eliminar</button>
              `
      }

      monthContainer.appendChild(incomeItem)
    })

    // Add month summary
    const monthSummary = document.createElement("div")
    monthSummary.className = "income-month-summary"
    monthSummary.innerHTML = `
          <div class="income-month-total">
              <span>Total del Mes:</span>
              <span>$${formatCurrency(monthlyBase + monthlyExtras)}</span>
          </div>
          ${
            monthlyExtras > 0
              ? `
              <div class="income-month-breakdown">
                  <div>Sueldo Base: $${formatCurrency(monthlyBase)}</div>
                  <div>Ingresos Extra: +$${formatCurrency(monthlyExtras)}</div>
              </div>
          `
              : ""
          }
      `

    monthContainer.appendChild(monthSummary)
    incomeHistoryList.appendChild(monthContainer)
  })
}

// Edit monthly income
function editMonthlyIncome(month) {
  const income = monthlyIncomes.find((inc) => inc.month === month)
  if (!income) return

  // Establecer los valores en el formulario
  document.getElementById("income-month").value = income.month
  document.getElementById("monthly-income").value = income.amount
  document.getElementById("income-notes").value = income.notes || ""

  // Hacer scroll al formulario para que sea visible
  document.getElementById("income-form").scrollIntoView({ behavior: "smooth" })

  // Mostrar un mensaje para indicar al usuario que puede editar
  showSuccessModal(
    "Editar Sueldo",
    `Puede modificar el sueldo de ${formatMonth(month)} en el formulario. Haga clic en "Guardar Sueldo" para confirmar los cambios.`,
  )

  // Switch to income tab
  switchToIncomeTab()
}

// Confirm delete extra income
function confirmDeleteExtraIncome(id) {
  const income = extraIncomes.find((inc) => inc.id === id)
  if (!income) return

  // Set the current extra income to delete
  currentExtraIncomeToDelete = id

  // Show delete confirmation modal
  deleteDetails.innerHTML = `
    <p>¿Estás seguro que deseas eliminar el ingreso extra <span class="expense-name-highlight">${income.description}</span>?</p>
    <p>Monto: <strong>$${formatCurrency(income.amount)}</strong> - Mes: <strong>${formatMonth(income.month)}</strong></p>
    <p>Esta acción no se puede deshacer.</p>
  `

  deleteModal.style.display = "block"
}

// Delete extra income (after confirmation)
function deleteExtraIncomeConfirmed(id) {
  const income = extraIncomes.find((inc) => inc.id === id)
  if (!income) return

  const description = income.description
  const month = formatMonth(income.month)

  extraIncomes = extraIncomes.filter((income) => income.id !== id)
  saveExtraIncomes()
  renderIncomeHistory()
  updateIncomeSummary()
  updateTotalExpensesSummary()

  // Show success modal
  showSuccessModal(
    "Ingreso Extra Eliminado",
    `El ingreso extra "${description}" para ${month} ha sido eliminado correctamente.`,
  )
}

// Initialize tabs functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      const tabId = `${button.dataset.tab}-tab`
      document.getElementById(tabId).classList.add("active")
    })
  })
}

// Add a new planned expense
function addPlannedExpense(e) {
  e.preventDefault()

  const name = document.getElementById("planning-name").value
  const amount = Number.parseFloat(document.getElementById("planning-amount").value)
  const category = document.getElementById("planning-category").value
  const priority = document.getElementById("planning-priority").value
  const dateStr = document.getElementById("planning-date").value
  const notes = document.getElementById("planning-notes").value

  // Obtener información de gasto recurrente
  const isRecurring = document.getElementById("recurring-expense")?.checked || false
  const recurringMonths = isRecurring ? Number.parseInt(document.getElementById("recurring-months").value) || 1 : 0
  const recurringOptions = document.getElementById("recurring-options")

  if (!name || isNaN(amount) || !category || !priority || !dateStr || amount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  // Fix date timezone issue by parsing parts manually
  const [year, month, day] = dateStr.split("-").map(Number)
  const plannedDate = new Date(year, month - 1, day)

  // Crear el gasto base
  const plannedExpense = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    priority,
    date: plannedDate.toISOString().split("T")[0],
    notes,
    createdAt: new Date().toISOString(),
    completed: false,
    isRecurring,
    recurringMonths: isRecurring ? recurringMonths : 0,
  }

  // Añadir el gasto principal
  plannedExpenses.push(plannedExpense)

  // Si es recurrente, crear los gastos adicionales
  if (isRecurring && recurringMonths > 1) {
    for (let i = 1; i < recurringMonths; i++) {
      const nextDate = new Date(year, month - 1 + i, day)
      const recurringExpense = {
        id: Date.now().toString() + "-" + i,
        name: name + " (recurrente " + (i + 1) + "/" + recurringMonths + ")",
        amount,
        category,
        priority,
        date: nextDate.toISOString().split("T")[0],
        notes: notes ? notes + " (Gasto recurrente)" : "Gasto recurrente",
        createdAt: new Date().toISOString(),
        completed: false,
        isRecurring: true,
        recurringMonths: 0, // Para evitar recursión
        parentId: plannedExpense.id,
      }
      plannedExpenses.push(recurringExpense)
    }
  }

  savePlannedExpenses()
  renderPlannedExpenses()
  updatePlanningSummary()
  updateIncomeSummary()
  updateTotalExpensesSummary()

  // Show success modal with continue tour button if we're in tour mode
  if (localStorage.getItem("tourInProgress") === "true") {
    showSuccessModalWithTourContinue(
      "Gasto Registrado",
      `El gasto "${name}" ha sido registrado correctamente.${isRecurring ? ` Se repetirá durante ${recurringMonths} meses.` : ""}`,
      "summary",
    )
  } else {
    // Regular success modal
    showSuccessModal(
      "Gasto Registrado",
      `El gasto "${name}" ha sido registrado correctamente.${isRecurring ? ` Se repetirá durante ${recurringMonths} meses.` : ""}`,
    )
  }

  // Reset form
  planningForm.reset()
  document.getElementById("planning-date").valueAsDate = new Date()
  if (recurringOptions) {
    recurringOptions.classList.remove("show")
  }

  // Switch to summary tab after adding expense
  const summaryTabButton = document.querySelector('.tab-button[data-tab="summary"]')
  if (summaryTabButton) {
    summaryTabButton.click()
  }
}

// Save planned expenses to localStorage
function savePlannedExpenses() {
  localStorage.setItem("plannedExpenses", JSON.stringify(plannedExpenses))
}

// Apply filters to the planned expenses list
function applyFilters() {
  activeFilters.category = filterCategory.value
  activeFilters.priority = filterPriority.value
  renderPlannedExpenses()
}

// Modificar la función renderPlannedExpenses para manejar tanto los gastos pendientes como los completados
function renderPlannedExpenses() {
  planningPendingList.innerHTML = ""
  planningCompletedList.innerHTML = ""

  if (plannedExpenses.length === 0) {
    planningPendingList.innerHTML = '<p class="no-expenses">No hay gastos planificados pendientes.</p>'
    planningCompletedList.innerHTML = '<p class="no-expenses">No hay gastos planificados completados.</p>'
    return
  }

  // Separate pending and completed expenses
  const pendingExpenses = plannedExpenses.filter((expense) => !expense.completed)
  const completedExpenses = plannedExpenses.filter((expense) => expense.completed)

  // Filter pending expenses based on active filters
  let filteredPendingExpenses = pendingExpenses

  if (activeFilters.category !== "todos") {
    filteredPendingExpenses = filteredPendingExpenses.filter((expense) => expense.category === activeFilters.category)
  }

  if (activeFilters.priority !== "todos") {
    filteredPendingExpenses = filteredPendingExpenses.filter((expense) => expense.priority === activeFilters.priority)
  }

  // Sort expenses by date (closest first)
  filteredPendingExpenses.sort((a, b) => new Date(a.date) - new Date(b.date))
  completedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)) // Completed sorted newest first

  // Render pending expenses
  if (filteredPendingExpenses.length === 0) {
    planningPendingList.innerHTML =
      '<p class="no-expenses">No hay gastos pendientes que coincidan con los filtros seleccionados.</p>'
  } else {
    renderExpensesList(filteredPendingExpenses, planningPendingList)
  }

  // Render completed expenses
  if (completedExpenses.length === 0) {
    planningCompletedList.innerHTML = '<p class="no-expenses">No hay gastos completados.</p>'
  } else {
    renderExpensesList(completedExpenses, planningCompletedList)
  }

  // Actualizar el resumen para mostrar los gastos pendientes del mes actual
  updatePlanningSummary()
}

// Render a list of expenses to a specific container
function renderExpensesList(expenses, container) {
  expenses.forEach((expense) => {
    const expenseCard = document.createElement("div")
    expenseCard.className = expense.completed ? "completed-expense-card" : "expense-card planning-card"

    const expenseDate = new Date(expense.date)
    const formattedDate = expenseDate.toLocaleDateString()
    const createdDate = new Date(expense.createdAt)
    const formattedCreatedDate = createdDate.toLocaleDateString()

    // Create the header (always visible)
    const expenseHeader = document.createElement("div")
    expenseHeader.className = expense.completed ? "completed-expense-header" : "expense-header"
    expenseHeader.innerHTML = `
          <div class="expense-title-container">
              <span class="expense-toggle">▶</span>
              <div class="expense-title">${expense.name}</div>
          </div>
          <div class="expense-summary">
              <div class="expense-summary-item">Monto: $${formatCurrency(expense.amount)}</div>
              <div class="expense-summary-item priority-badge ${expense.priority}">${getPriorityText(expense.priority)}</div>
              <div class="expense-actions">
                  <button class="complete-button ${expense.completed ? "completed" : ""}" onclick="toggleCompleteExpense('${expense.id}', event)">
                      ${expense.completed ? "Completado" : "Marcar Completado"}
                  </button>
                  <button class="delete-button" onclick="confirmDeletePlannedExpense('${expense.id}', event)">Eliminar</button>
              </div>
          </div>
      `

    // Create the content (collapsible)
    const expenseContent = document.createElement("div")
    expenseContent.className = "expense-content"
    expenseContent.innerHTML = `
          <div class="expense-date">Registrado: ${formattedCreatedDate}</div>
          <div class="expense-details">
              <div class="expense-detail"><strong>Monto:</strong> $${formatCurrency(expense.amount)}</div>
              <div class="expense-detail"><strong>Categoría:</strong> ${getCategoryText(expense.category)}</div>
              <div class="expense-detail"><strong>Prioridad:</strong> ${getPriorityText(expense.priority)}</div>
              <div class="expense-detail"><strong>Fecha Estimada:</strong> ${formattedDate}</div>
              ${expense.notes ? `<div class="expense-detail"><strong>Notas:</strong> ${expense.notes}</div>` : ""}
              <div class="expense-detail"><strong>Estado:</strong> ${expense.completed ? '<span class="status-paid">Completado</span>' : '<span class="status-pending">Pendiente</span>'}</div>
          </div>
      `

    expenseCard.appendChild(expenseHeader)
    expenseCard.appendChild(expenseContent)

    // Add toggle functionality
    expenseHeader.addEventListener("click", () => {
      const toggle = expenseHeader.querySelector(".expense-toggle")
      toggle.classList.toggle("open")
      expenseContent.classList.toggle("open")
    })

    container.appendChild(expenseCard)
  })
}

// Get text representation of category
function getCategoryText(category) {
  const categories = {
    hogar: "Hogar",
    transporte: "Transporte",
    alimentacion: "Alimentación",
    salud: "Salud",
    educacion: "Educación",
    entretenimiento: "Entretenimiento",
    otros: "Otros",
  }
  return categories[category] || category
}

// Get text representation of priority
function getPriorityText(priority) {
  const priorities = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  }
  return priorities[priority] || priority
}

// Toggle expense completion status
function toggleCompleteExpense(expenseId, event) {
  event.stopPropagation()

  const expenseIndex = plannedExpenses.findIndex((expense) => expense.id === expenseId)
  if (expenseIndex === -1) return

  const wasCompleted = plannedExpenses[expenseIndex].completed
  plannedExpenses[expenseIndex].completed = !wasCompleted

  savePlannedExpenses()
  renderPlannedExpenses()
  updatePlanningSummary()
  updateIncomeSummary()
  updateTotalExpensesSummary()

  // Show success modal
  showSuccessModal(
    wasCompleted ? "Gasto Reactivado" : "Gasto Completado",
    wasCompleted
      ? `El gasto "${plannedExpenses[expenseIndex].name}" ha sido marcado como pendiente.`
      : `El gasto "${plannedExpenses[expenseIndex].name}" ha sido marcado como completado.`,
  )
}

// Confirm delete planned expense
function confirmDeletePlannedExpense(expenseId, event) {
  // Stop the click event from propagating to the parent (which would toggle the expense)
  event.stopPropagation()

  const expense = plannedExpenses.find((exp) => exp.id === expenseId)
  if (!expense) return

  // Set the current expense to delete
  currentExpenseToDelete = expenseId

  // Show delete confirmation modal
  deleteDetails.innerHTML = `
      <p>¿Estás seguro que deseas eliminar el gasto planificado <span class="expense-name-highlight">${expense.name}</span>?</p>
      <p>Este gasto está <strong>${expense.completed ? "completado" : "pendiente"}</strong>.</p>
      <p>Esta acción no se puede deshacer.</p>
  `

  deleteModal.style.display = "block"
}

// Delete planned expense
function deletePlannedExpense(expenseId) {
  const expense = plannedExpenses.find((exp) => exp.id === expenseId)
  const expenseName = expense ? expense.name : "Gasto"

  plannedExpenses = plannedExpenses.filter((expense) => expense.id !== expenseId)
  savePlannedExpenses()
  renderPlannedExpenses()
  updatePlanningSummary()
  updateIncomeSummary()
  updateTotalExpensesSummary()

  // Show success modal
  showSuccessModal("Gasto Eliminado", `El gasto "${expenseName}" ha sido eliminado correctamente.`)
}

// Modificar la función updatePlanningSummary para mostrar solo los gastos pendientes del mes actual con mejor distribución
function updatePlanningSummary() {
  if (plannedExpenses.length === 0) {
    planningSummary.innerHTML = "<p>No hay gastos planificados registrados.</p>"
    return
  }

  // Calculate totals
  let totalPending = 0
  let totalCompleted = 0
  let pendingCount = 0
  let completedCount = 0
  let highPriorityCount = 0
  let highPriorityAmount = 0

  // Group expenses by category
  const categoryTotals = {}

  // Group expenses by month
  const monthlyTotals = {}

  plannedExpenses.forEach((expense) => {
    const amount = expense.amount

    // Add to category totals
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = {
        name: getCategoryText(expense.category),
        amount: 0,
        count: 0,
        pendingAmount: 0,
        completedAmount: 0,
      }
    }
    categoryTotals[expense.category].amount += amount
    categoryTotals[expense.category].count++

    if (expense.completed) {
      categoryTotals[expense.category].completedAmount += amount
    } else {
      categoryTotals[expense.category].pendingAmount += amount
    }

    // Add to monthly totals
    const expenseDate = new Date(expense.date)
    const monthYear = `${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`

    if (!monthlyTotals[monthYear]) {
      monthlyTotals[monthYear] = {
        month: expenseDate.toLocaleString("default", { month: "long" }),
        year: expenseDate.getFullYear(),
        amount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        count: 0,
        date: expenseDate,
      }
    }
    monthlyTotals[monthYear].amount += amount
    monthlyTotals[monthYear].count++

    if (expense.completed) {
      monthlyTotals[monthYear].completedAmount += amount
      totalCompleted += amount
      completedCount++
    } else {
      monthlyTotals[monthYear].pendingAmount += amount
      totalPending += amount
      pendingCount++

      if (expense.priority === "alta") {
        highPriorityCount++
        highPriorityAmount += amount
      }
    }
  })

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number)
    const [monthB, yearB] = b.split("/").map(Number)

    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  // Create summary HTML
  const summaryHTML = `
      <div class="summary-grid">
          <div class="summary-card">
              <div class="summary-title">Gastos Pendientes</div>
              <div class="summary-amount">$${formatCurrency(totalPending)}</div>
              <div class="summary-subtitle">${pendingCount} gastos planificados</div>
          </div>
          <div class="summary-card">
              <div class="summary-title">Gastos Completados</div>
              <div class="summary-amount positive">$${formatCurrency(totalCompleted)}</div>
              <div class="summary-subtitle">${completedCount} gastos realizados</div>
          </div>
          <div class="summary-card priority-high">
              <div class="summary-title">Prioridad Alta</div>
              <div class="summary-amount">$${formatCurrency(highPriorityAmount)}</div>
              <div class="summary-subtitle">${highPriorityCount} gastos prioritarios</div>
          </div>
      </div>
  `

  // Añadir la sección de gastos pendientes del mes actual
  // Obtener el mes y año actual
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Filtrar los gastos pendientes del mes actual
  const currentMonthPendingExpenses = plannedExpenses.filter((expense) => {
    if (expense.completed) return false

    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear
  })

  // Ordenar por fecha (más cercana primero) y luego por prioridad
  currentMonthPendingExpenses.sort((a, b) => {
    // Primero ordenar por fecha
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB
    }

    // Si las fechas son iguales, ordenar por prioridad (alta > media > baja)
    const priorityOrder = { alta: 1, media: 2, baja: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  let currentMonthExpensesHTML = `
    <div class="summary-section">
      <h3>Gastos Pendientes del Mes Actual (${new Date().toLocaleString("default", { month: "long" })} ${currentYear})</h3>
  `

  if (currentMonthPendingExpenses.length === 0) {
    currentMonthExpensesHTML += '<p class="no-expenses">No hay gastos pendientes para el mes actual.</p>'
  } else {
    currentMonthExpensesHTML += '<div class="pending-expenses-list">'

    currentMonthPendingExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const formattedDate = expenseDate.toLocaleDateString()

      currentMonthExpensesHTML += `
        <div class="expense-card planning-card">
          <div class="expense-header">
            <div class="expense-title-container">
              <span class="expense-toggle">▶</span>
              <div class="expense-title">${expense.name} - Monto: $${formatCurrency(expense.amount)} <span class="priority-badge ${expense.priority}">${getPriorityText(expense.priority)}</span></div>
            </div>
            <div class="expense-actions">
              <button class="complete-button" onclick="toggleCompleteExpense('${expense.id}', event)">
                Marcar Completado
              </button>
              <button class="delete-button" onclick="confirmDeletePlannedExpense('${expense.id}', event)">Eliminar</button>
            </div>
          </div>
          <div class="expense-content">
            <div class="expense-date">Fecha Estimada: ${formattedDate}</div>
            <div class="expense-details">
              <div class="expense-detail"><strong>Monto:</strong> $${formatCurrency(expense.amount)}</div>
              <div class="expense-detail"><strong>Categoría:</strong> ${getCategoryText(expense.category)}</div>
              <div class="expense-detail"><strong>Prioridad:</strong> ${getPriorityText(expense.priority)}</div>
              ${expense.notes ? `<div class="expense-detail"><strong>Notas:</strong> ${expense.notes}</div>` : ""}
            </div>
          </div>
        </div>
      `
    })

    currentMonthExpensesHTML += "</div>"
  }

  currentMonthExpensesHTML += "</div>"

  // Create category breakdown
  let categoryHTML = `
      <div class="summary-section">
          <h3>Gastos por Categoría</h3>
          <div class="category-breakdown">
  `

  Object.values(categoryTotals)
    .sort((a, b) => b.amount - a.amount)
    .forEach((category) => {
      categoryHTML += `
          <div class="category-item">
              <div class="category-name">${category.name}</div>
              <div class="category-amount">$${formatCurrency(category.amount)}</div>
              <div class="category-breakdown-details">
                  <div>Pendiente: $${formatCurrency(category.pendingAmount)}</div>
                  <div>Completado: $${formatCurrency(category.completedAmount)}</div>
              </div>
              <div class="category-count">${category.count} gastos</div>
          </div>
      `
    })

  categoryHTML += `
          </div>
      </div>
  `

  // Create monthly breakdown
  let monthlyHTML = `
      <div class="summary-section">
          <h3>Gastos por Mes</h3>
          <div class="monthly-breakdown">
  `

  sortedMonths.forEach((monthYear) => {
    const { month, year, amount, pendingAmount, completedAmount, count } = monthlyTotals[monthYear]
    monthlyHTML += `
          <div class="monthly-item">
              <div class="monthly-date">${month} ${year}</div>
              <div class="monthly-amount">$${formatCurrency(amount)}</div>
              <div class="monthly-breakdown-details">
                  <div>Pendiente: $${formatCurrency(pendingAmount)}</div>
                  <div>Completado: $${formatCurrency(completedAmount)}</div>
              </div>
              <div class="monthly-count">${count} gastos</div>
          </div>
      `
  })

  monthlyHTML += `
          </div>
      </div>
  `

  // Set the summary HTML
  planningSummary.innerHTML = summaryHTML + currentMonthExpensesHTML + categoryHTML + monthlyHTML

  // Add toggle functionality to the expense cards in the summary
  const expenseHeaders = planningSummary.querySelectorAll(".expense-header")
  expenseHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const toggle = header.querySelector(".expense-toggle")
      const content = header.nextElementSibling

      toggle.classList.toggle("open")
      content.classList.toggle("open")
    })
  })
}

// Modificar la función renderPlannedExpenses para manejar tanto los gastos pendientes como los completados

// Modificar la función saveIncome para corregir el problema de la fecha

// Modificar la función addExtraIncome para corregir el problema de la fecha

// Update income summary with available balance calculations
function updateIncomeSummary() {
  // Get credit card expenses from localStorage
  const creditCardExpenses = JSON.parse(localStorage.getItem("expenses")) || []

  // Group expenses by month
  const monthlyExpenses = {}

  // Process credit card expenses
  creditCardExpenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      if (!installment.paid) {
        const dueDate = new Date(installment.dueDate)
        const monthStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}`

        if (!monthlyExpenses[monthStr]) {
          monthlyExpenses[monthStr] = {
            month: monthStr,
            formattedMonth: formatMonth(monthStr),
            creditCardAmount: 0,
            plannedAmount: 0,
            totalAmount: 0,
            creditCardDetails: [],
            plannedDetails: [],
          }
        }

        const amount = Number.parseFloat(installment.amount)
        monthlyExpenses[monthStr].creditCardAmount += amount
        monthlyExpenses[monthStr].totalAmount += amount

        monthlyExpenses[monthStr].creditCardDetails.push({
          name: expense.name,
          installment: `${installment.number}/${expense.installmentsCount}`,
          amount: amount,
        })
      }
    })
  })

  // Process planned expenses
  plannedExpenses.forEach((expense) => {
    if (!expense.completed) {
      const expenseDate = new Date(expense.date)
      const monthStr = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyExpenses[monthStr]) {
        monthlyExpenses[monthStr] = {
          month: monthStr,
          formattedMonth: formatMonth(monthStr),
          creditCardAmount: 0,
          plannedAmount: 0,
          totalAmount: 0,
          creditCardDetails: [],
          plannedDetails: [],
        }
      }

      monthlyExpenses[monthStr].plannedAmount += expense.amount
      monthlyExpenses[monthStr].totalAmount += expense.amount

      monthlyExpenses[monthStr].plannedDetails.push({
        name: expense.name,
        category: getCategoryText(expense.category),
        priority: expense.priority,
        amount: expense.amount,
      })
    }
  })

  // Get current month
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

  // Separate months into past, current, and future
  const pastMonths = []
  const futureMonths = []
  let currentMonthData = null

  Object.keys(monthlyExpenses).forEach((monthStr) => {
    const monthDate = new Date(monthStr + "-01")

    if (monthStr === currentMonth) {
      currentMonthData = monthlyExpenses[monthStr]
    } else if (monthDate < currentDate) {
      // If the month is before the current month
      pastMonths.push(monthStr)
    } else {
      // If the month is after the current month
      futureMonths.push(monthStr)
    }
  })

  // Sort months chronologically
  pastMonths.sort()
  futureMonths.sort()

  // Create HTML for the income summary
  let html = ""

  if (Object.keys(monthlyExpenses).length === 0) {
    html = `<p class="no-expenses">No hay gastos pendientes registrados para calcular el saldo disponible.</p>`
  } else {
    // Current Month Section (if exists)
    if (currentMonthData) {
      html += `
                <div class="current-month-section">
                    <h3>Saldo Disponible del Mes Actual</h3>
                    ${renderMonthBalanceItem(currentMonthData, true)}
                </div>
            `
    }

    // Future Months Section
    if (futureMonths.length > 0) {
      html += `
                <div class="future-months-section">
                    <h3>Saldo Proyectado para Meses Futuros</h3>
                    <div class="monthly-balance-list">
            `

      futureMonths.forEach((monthStr) => {
        html += renderMonthBalanceItem(monthlyExpenses[monthStr])
      })

      html += `
                    </div>
                </div>
            `
    }

    // Past Months Section
    if (pastMonths.length > 0) {
      html += `
                <div class="past-months-section">
                    <h3>Historial de Saldos de Meses Anteriores</h3>
                    <div class="monthly-balance-list">
            `

      // Reverse to show most recent past months first
      pastMonths.reverse().forEach((monthStr) => {
        html += renderMonthBalanceItem(monthlyExpenses[monthStr])
      })

      html += `
                    </div>
                </div>
            `
    }
  }

  incomeSummary.innerHTML = html
}

// Helper function to render a month balance item
function renderMonthBalanceItem(monthData, isCurrentMonth = false) {
  // Get income for this month
  const monthlyIncome = monthlyIncomes.find((income) => income.month === monthData.month)
  const monthlyIncomeAmount = monthlyIncome ? monthlyIncome.amount : 0

  // Get extra incomes for this month
  const monthlyExtras = extraIncomes.filter((income) => income.month === monthData.month)
  const extraIncomeAmount = monthlyExtras.reduce((sum, income) => sum + income.amount, 0)

  // Calculate total income
  const totalIncome = monthlyIncomeAmount + extraIncomeAmount

  // Calculate available balance
  const availableBalance = totalIncome - monthData.totalAmount
  const balancePercentage = totalIncome > 0 ? (availableBalance / totalIncome) * 100 : 0

  const balanceClass = balancePercentage < 20 ? "critical" : balancePercentage < 40 ? "warning" : "positive"

  const monthItemClass = isCurrentMonth ? "monthly-balance-item current-month" : "monthly-balance-item"

  return `
        <div class="${monthItemClass}">
            <div class="monthly-balance-header">
                <div class="monthly-balance-date">${monthData.formattedMonth} ${isCurrentMonth ? '<span class="current-month-badge">Mes Actual</span>' : ""}</div>
                <div class="monthly-balance-income">
                    ${
                      totalIncome > 0
                        ? `<span>Ingresos: $${formatCurrency(totalIncome)}</span>`
                        : `<span class="no-income-warning">Sin ingresos registrados</span>`
                    }
                </div>
            </div>
            
            <div class="monthly-balance-content">
                ${
                  totalIncome > 0
                    ? `
                    <div class="balance-summary">
                        <div class="balance-summary-item">
                            <span>Saldo Disponible:</span>
                            <span class="balance-amount ${balanceClass}">$${formatCurrency(availableBalance)}</span>
                        </div>
                        <div class="balance-percentage">
                            <div class="balance-bar-container">
                                <div class="balance-bar ${balanceClass}" style="width: ${Math.max(0, Math.min(100, balancePercentage))}%"></div>
                            </div>
                            <div class="balance-percentage-text">
                                ${balancePercentage.toFixed(1)}% disponible
                            </div>
                        </div>
                    </div>
                `
                    : `
                    <div class="no-income-message">
                        <p>No has registrado ingresos para este mes. Registra tu sueldo para ver el saldo disponible.</p>
                        <button class="btn-primary planning-btn" onclick="switchToIncomeTab()">Registrar Ingresos</button>
                    </div>
                `
                }
                
                <div class="expense-breakdown">
                    <h4>Desglose de Gastos</h4>
                    <div class="expense-breakdown-grid">
                        <div class="expense-breakdown-item">
                            <div class="expense-breakdown-title">Tarjeta de Crédito</div>
                            <div class="expense-breakdown-amount">$${formatCurrency(monthData.creditCardAmount)}</div>
                            ${
                              monthData.creditCardDetails.length > 0
                                ? `
                                <div class="expense-breakdown-details">
                                    ${monthData.creditCardDetails
                                      .map(
                                        (detail) => `
                                        <div class="expense-detail-item">
                                            <span>${detail.name} (Cuota ${detail.installment})</span>
                                            <span>$${formatCurrency(detail.amount)}</span>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            `
                                : ""
                            }
                        </div>
                        <div class="expense-breakdown-item">
                            <div class="expense-breakdown-title">Gastos Planificados</div>
                            <div class="expense-breakdown-amount">$${formatCurrency(monthData.plannedAmount)}</div>
                            ${
                              monthData.plannedDetails.length > 0
                                ? `
                                <div class="expense-breakdown-details">
                                    ${monthData.plannedDetails
                                      .map(
                                        (detail) => `
                                        <div class="expense-detail-item">
                                            <span><span class="priority-badge ${detail.priority}">${getPriorityText(detail.priority)}</span>${detail.name} </span>
                                            <span>$${formatCurrency(detail.amount)}</span>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    <div class="expense-breakdown-total">
                        <span>Total Gastos:</span>
                        <span>$${formatCurrency(monthData.totalAmount)}</span>
                    </div>
                </div>
                
                ${
                  totalIncome > 0
                    ? `
                    <div class="income-breakdown">
                        <h4>Desglose de Ingresos</h4>
                        <div class="income-breakdown-details">
                            <div class="income-detail-item">
                                <span>Sueldo Base:</span>
                                <span>$${formatCurrency(monthlyIncomeAmount)}</span>
                            </div>
                            ${
                              extraIncomeAmount > 0
                                ? `
                                <div class="income-detail-item">
                                    <span>Ingresos Extra (${monthlyExtras.length}):</span>
                                    <span>$${formatCurrency(extraIncomeAmount)}</span>
                                </div>
                                <div class="extra-income-details">
                                    ${monthlyExtras
                                      .map(
                                        (extra) => `
                                        <div class="extra-income-item">
                                            <span>${extra.description}</span>
                                            <span>$${formatCurrency(extra.amount)}</span>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            `
                                : ""
                            }
                            <div class="income-detail-item total">
                                <span>Total Ingresos:</span>
                                <span>$${formatCurrency(totalIncome)}</span>
                            </div>
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `
}

// Update total expenses summary (combining credit card and planned expenses)
function updateTotalExpensesSummary() {
  // Get credit card expenses from localStorage
  const creditCardExpenses = JSON.parse(localStorage.getItem("expenses")) || []

  // Calculate credit card totals
  let creditCardPending = 0
  let creditCardPaid = 0

  creditCardExpenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      const amount = Number.parseFloat(installment.amount)
      if (installment.paid) {
        creditCardPaid += amount
      } else {
        creditCardPending += amount
      }
    })
  })

  // Calculate planned expenses totals
  let plannedPending = 0
  let plannedCompleted = 0

  plannedExpenses.forEach((expense) => {
    if (expense.completed) {
      plannedCompleted += expense.amount
    } else {
      plannedPending += expense.amount
    }
  })

  // Calculate totals
  const totalPending = creditCardPending + plannedPending
  const totalPaid = creditCardPaid + plannedCompleted

  // Create HTML
  const html = `
      <div class="total-summary">
          <div class="total-summary-header">
              <h3>Resumen Financiero Global</h3>
              <p>Combinación de gastos de tarjeta de crédito y gastos planificados</p>
          </div>
          
          <div class="financial-section">
              <h4 class="financial-section-title">Gastos Pendientes</h4>
              <div class="summary-grid">
                  <div class="summary-card total-card">
                      <div class="summary-title">Tarjeta de Crédito</div>
                      <div class="summary-amount">$${formatCurrency(creditCardPending)}</div>
                  </div>
                  <div class="summary-card total-card">
                      <div class="summary-title">Gastos Planificados</div>
                      <div class="summary-amount">$${formatCurrency(plannedPending)}</div>
                  </div>
                  <div class="summary-card total-card pending-total">
                      <div class="summary-title">Total Pendiente</div>
                      <div class="summary-amount">$${formatCurrency(totalPending)}</div>
                  </div>
              </div>
          </div>
          
          <div class="financial-section">
              <h4 class="financial-section-title">Gastos Pagados/Completados</h4>
              <div class="summary-grid">
                  <div class="summary-card total-card">
                      <div class="summary-title">Tarjeta de Crédito</div>
                      <div class="summary-amount positive">$${formatCurrency(creditCardPaid)}</div>
                  </div>
                  <div class="summary-card total-card">
                      <div class="summary-title">Gastos Planificados</div>
                      <div class="summary-amount positive">$${formatCurrency(plannedCompleted)}</div>
                  </div>
                  <div class="summary-card total-card completed-total">
                      <div class="summary-title">Total Pagado</div>
                      <div class="summary-amount positive">$${formatCurrency(totalPaid)}</div>
                  </div>
              </div>
          </div>
          
          <div class="financial-advice">
              <h4>Recomendaciones Financieras</h4>
              <ul>
                  <li>Prioriza los gastos de alta prioridad y las cuotas de tarjeta de crédito.</li>
                  <li>Considera posponer gastos planificados de baja prioridad si tu presupuesto es ajustado.</li>
                  <li>Revisa regularmente tus gastos para mantener un control efectivo de tus finanzas.</li>
                  <li>Considera establecer un fondo de emergencia antes de realizar gastos no esenciales.</li>
              </ul>
          </div>
      </div>
  `

  totalExpensesSummary.innerHTML = html
}

// Switch to income tab
function switchToIncomeTab() {
  const incomeTabButton = document.querySelector('.tab-button[data-tab="income"]')
  if (incomeTabButton) {
    incomeTabButton.click()
  }
}

// Añadir una nueva función para mostrar el modal de éxito con botón para continuar el tour
function showSuccessModalWithTourContinue(title, message, nextStep) {
  successTitle.textContent = title
  successMessage.textContent = message

  // Añadir botón para continuar el tour
  const continueButton = document.createElement("button")
  continueButton.id = "continue-tour-button"
  continueButton.className = "btn-primary"
  continueButton.textContent = "Continuar con el Tour"
  continueButton.style.marginRight = "10px"

  // Limpiar botones anteriores
  const modalFooter = document.querySelector(".success-modal-footer")
  if (modalFooter) {
    modalFooter.innerHTML = ""
    modalFooter.appendChild(continueButton)
    modalFooter.appendChild(successOk.cloneNode(true))

    // Actualizar el event listener para el botón OK
    modalFooter.querySelector("#success-ok").addEventListener("click", () => {
      successModal.style.display = "none"
    })

    // Añadir event listener para el botón continuar
    continueButton.addEventListener("click", () => {
      successModal.style.display = "none"
      continueTour(nextStep)
    })
  } else {
    // Si no existe el footer, crear uno nuevo
    const newFooter = document.createElement("div")
    newFooter.className = "success-modal-footer"
    newFooter.appendChild(continueButton)
    newFooter.appendChild(successOk.cloneNode(true))

    // Actualizar el contenido del modal
    const modalContent = successModal.querySelector(".modal-content")
    modalContent.appendChild(newFooter)

    // Añadir event listeners
    newFooter.querySelector("#success-ok").addEventListener("click", () => {
      successModal.style.display = "none"
    })

    continueButton.addEventListener("click", () => {
      successModal.style.display = "none"
      continueTour(nextStep)
    })
  }

  successModal.style.display = "block"
}

// Añadir función para continuar con el tour
function continueTour(nextStep) {
  // Redirigir a la página de app.html con el paso siguiente
  window.location.href = `app.html?continue=${nextStep}`
}

// Modificar la función checkTourContinuation para manejar los diferentes pasos del tour
function checkTourContinuation() {
  const urlParams = new URLSearchParams(window.location.search)
  const tourParam = urlParams.get("tour")

  if (tourParam) {
    // Marcar que el tour está en progreso
    localStorage.setItem("tourInProgress", "true")

    // Remove the parameter from the URL without refreshing
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)

    // Continue the tour based on the parameter
    if (tourParam === "income") {
      // Switch to income tab
      const incomeTabButton = document.querySelector('.tab-button[data-tab="income"]')
      if (incomeTabButton) {
        incomeTabButton.click()

        // Show a guide tooltip for the income form
        setTimeout(() => {
          showTourTooltip(
            document.getElementById("income-form"),
            "Registra tu Sueldo Mensual",
            'Ingresa el mes actual, tu sueldo mensual y haz clic en "Guardar Sueldo". Después de guardar, podrás continuar con el tour.',
            "top",
          )
        }, 500)
      }
    } else if (tourParam === "extra-income") {
      // Switch to income tab and scroll to extra income form
      const incomeTabButton = document.querySelector('.tab-button[data-tab="income"]')
      if (incomeTabButton) {
        incomeTabButton.click()

        // Scroll to extra income form
        setTimeout(() => {
          document.getElementById("extra-income-form").scrollIntoView({ behavior: "smooth" })

          // Show a guide tooltip for the extra income form
          showTourTooltip(
            document.getElementById("extra-income-form"),
            "Agrega un Ingreso Extra",
            "Registra un ingreso adicional como un bono o trabajo freelance. Después de agregar, podrás continuar con el tour.",
            "top",
          )
        }, 500)
      }
    } else if (tourParam === "planning") {
      // Switch to planning tab
      const planningTabButton = document.querySelector('.tab-button[data-tab="register"]')
      if (planningTabButton) {
        planningTabButton.click()

        // Show a guide tooltip for the planning form
        setTimeout(() => {
          showTourTooltip(
            document.getElementById("planning-form"),
            "Registra un Gasto Planificado",
            'Completa el formulario con los detalles del gasto y haz clic en "Registrar Gasto". Después de registrar, podrás continuar con el tour.',
            "top",
          )
        }, 500)
      }
    } else if (tourParam === "summary") {
      // Switch to summary tab
      const summaryTabButton = document.querySelector('.tab-button[data-tab="summary"]')
      if (summaryTabButton) {
        summaryTabButton.click()

        // Show a guide tooltip for the summary section
        setTimeout(() => {
          showTourTooltip(
            document.getElementById("planning-summary"),
            "Visualiza tu Situación Financiera",
            'Aquí puedes ver un resumen de tus gastos planificados por categoría y mes. Haz clic en "Entendido" para continuar con el tour.',
            "top",
            () => {
              // Redirigir a app.html para finalizar el tour
              window.location.href = "app.html?continue=finish"
            },
          )
        }, 500)
      }
    }
  }
}

// Modificar la función showTourTooltip para permitir una acción al hacer clic en "Entendido"
function showTourTooltip(element, title, content, position = "bottom", onComplete = null) {
  if (!element) return

  // Create tooltip element if it doesn't exist
  let tooltip = document.getElementById("tour-tooltip")
  if (!tooltip) {
    tooltip = document.createElement("div")
    tooltip.id = "tour-tooltip"
    tooltip.className = "tour-tooltip"
    document.body.appendChild(tooltip)
  }

  // Set tooltip content
  tooltip.innerHTML = `
    <div class="tooltip-header">
      <h4>${title}</h4>
      <span class="tooltip-close">&times;</span>
    </div>
    <div class="tooltip-content">
      ${content}
    </div>
    <div class="tooltip-footer">
      <button class="tooltip-button">Entendido</button>
    </div>
  `

  // Position the tooltip
  const rect = element.getBoundingClientRect()
  const tooltipHeight = 200 // Approximate height

  if (position === "top") {
    tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`
    tooltip.style.left = `${rect.left + (rect.width / 2) - 150}px`
  } else {
    tooltip.style.top = `${rect.bottom + 10}px`
    tooltip.style.left = `${rect.left + (rect.width / 2) - 150}px`
  }

  // Show the tooltip
  tooltip.style.display = "block"

  // Add event listeners
  const closeButton = tooltip.querySelector(".tooltip-close")
  const actionButton = tooltip.querySelector(".tooltip-button")

  closeButton.addEventListener("click", () => {
    tooltip.style.display = "none"
    if (onComplete) onComplete()
  })

  actionButton.addEventListener("click", () => {
    tooltip.style.display = "none"
    if (onComplete) onComplete()
  })
}

// Make functions available globally
window.toggleCompleteExpense = toggleCompleteExpense
window.confirmDeletePlannedExpense = confirmDeletePlannedExpense
window.switchToIncomeTab = switchToIncomeTab
window.editMonthlyIncome = editMonthlyIncome
window.confirmDeleteExtraIncome = confirmDeleteExtraIncome
window.deleteExtraIncomeConfirmed = deleteExtraIncomeConfirmed

// Initialize the app
init()

