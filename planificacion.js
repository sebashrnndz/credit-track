<<<<<<< HEAD
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Planificación de Gastos</title>
<link rel="stylesheet" href="styles.css">
<!-- Añadir Chart.js desde CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<div class="container">
    <!-- Reemplazar la sección del app-header y tabs-container por este código -->
<div class="app-header">
  <a type="button" href="app.html" class="back-button">Inicio</a>
  <h1>Planificación General</h1>
  <div class="header-actions">
      <button id="menu-toggle" class="menu-toggle-btn">
          <span class="menu-icon">☰</span>
      </button>
      <div class="notification-icon" id="notification-icon">
          <i class="notification-bell">🔔</i>
          <span id="notification-counter" class="notification-counter">0</span>
=======
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

  if (!name || isNaN(amount) || !category || !priority || !dateStr || amount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  const plannedExpense = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    priority,
    date: dateStr,
    notes,
    createdAt: new Date().toISOString(),
    completed: false,
  }

  plannedExpenses.push(plannedExpense)
  savePlannedExpenses()
  renderPlannedExpenses()
  updatePlanningSummary()
  updateIncomeSummary()
  updateTotalExpensesSummary()

  // Show success modal with continue tour button if we're in tour mode
  if (localStorage.getItem("tourInProgress") === "true") {
    showSuccessModalWithTourContinue(
      "Gasto Registrado",
      `El gasto "${name}" ha sido registrado correctamente.`,
      "summary",
    )
  } else {
    // Regular success modal
    showSuccessModal("Gasto Registrado", `El gasto "${name}" ha sido registrado correctamente.`)
  }

  // Reset form
  planningForm.reset()
  document.getElementById("planning-date").valueAsDate = new Date()

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

// Render all planned expenses
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

// Update planning summary
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
>>>>>>> parent of e22d6bd (version 2.2 (mejoras en registros))
      </div>
  </div>
</div>

<<<<<<< HEAD
<!-- Reemplazar la sección del menú compacto por este código actualizado -->
<div id="compact-menu" class="compact-menu">
  <div class="compact-menu-content">
    <div class="menu-group">
      <div class="menu-group-header" data-group="summary">
        <span class="menu-icon">📊</span>
        <span>Resumen</span>
        <span class="nav-arrow">▶</span>
=======
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
>>>>>>> parent of e22d6bd (version 2.2 (mejoras en registros))
      </div>
      <div class="menu-group-items" id="summary-group">
        <button class="menu-item active" data-tab="summary">Resumen General</button>
        <button class="menu-item" data-tab="statistics">Estadísticas</button>
      </div>
    </div>
    
    <div class="menu-group">
      <div class="menu-group-header" data-group="finances">
        <span class="menu-icon">💰</span>
        <span>Finanzas</span>
        <span class="nav-arrow">▶</span>
      </div>
      <div class="menu-group-items" id="finances-group">
        <button class="menu-item" data-tab="income">Ingresos</button>
        <button class="menu-item" data-tab="balance">Saldo Disponible</button>
      </div>
    </div>
    
    <div class="menu-group">
      <div class="menu-group-header" data-group="expenses">
        <span class="menu-icon">📝</span>
        <span>Gastos</span>
        <span class="nav-arrow">▶</span>
      </div>
      <div class="menu-group-items" id="expenses-group">
        <button class="menu-item" data-tab="register">Registrar Gasto</button>
        <button class="menu-item" data-tab="pending">Gastos Pendientes</button>
        <button class="menu-item" data-tab="completed">Gastos Completados</button>
      </div>
    </div>
    
    <!-- Grupo para Tarjeta de Crédito -->
    <div class="menu-group">
      <div class="menu-group-header" data-group="credit">
        <span class="menu-icon">💳</span>
        <span>Tarjeta de Crédito</span>
        <span class="nav-arrow">▶</span>
      </div>
      <div class="menu-group-items" id="credit-group">
        <button class="menu-item" data-tab="credit-summary">Resumen</button>
        <button class="menu-item" data-tab="credit-register">Registrar Gasto</button>
        <button class="menu-item" data-tab="credit-pending">Cuotas Pendientes</button>
        <button class="menu-item" data-tab="credit-completed">Pagos Completados</button>
      </div>
    </div>
    
    <div class="menu-group">
      <div class="menu-group-header" data-group="tools">
        <span class="menu-icon">🔧</span>
        <span>Herramientas</span>
        <span class="nav-arrow">▶</span>
      </div>
      <div class="menu-group-items" id="tools-group">
        <button class="menu-item" data-tab="goals">Metas de Ahorro</button>
        <button class="menu-item" data-tab="calendar">Calendario</button>
        <button class="menu-item" data-tab="settings">Configuración</button>
      </div>
    </div>
  </div>
</div>

<<<<<<< HEAD
<!-- Contenedor de pestañas (mantener esto) -->
<div class="tabs-container">
        
        <!-- El contenido de las pestañas permanece igual -->
        <div class="tab-content active" id="summary-tab">
            <div class="planning-summary-container card">
                <h2>Resumen de Gastos Planificados</h2>
                <div id="planning-summary"></div>
=======
  // Set the summary HTML
  planningSummary.innerHTML = summaryHTML + categoryHTML + monthlyHTML
}

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
>>>>>>> parent of e22d6bd (version 2.2 (mejoras en registros))
            </div>
            
            <div class="total-expenses-container card">
                <h2>Resumen Financiero Total</h2>
                <div id="total-expenses-summary"></div>
            </div>
        </div>
        
        <div class="tab-content" id="income-tab">
            <div class="card">
                <h2>Gestión de Ingresos Mensuales</h2>
                <form id="income-form">
                    <div class="form-group">
                        <label for="income-month">Mes:</label>
                        <input type="month" id="income-month" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="monthly-income">Sueldo Base:</label>
                        <input type="number" id="monthly-income" min="1" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="income-notes">Notas sobre ingresos (opcional):</label>
                        <textarea id="income-notes" rows="3"></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary planning-btn">Guardar Sueldo</button>
                </form>
                
                <div class="extra-income-section">
                    <h3>Ingresos Extras</h3>
                    <form id="extra-income-form">
                        <div class="form-group">
                            <label for="extra-income-month">Mes:</label>
                            <input type="month" id="extra-income-month" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="extra-income-description">Descripción:</label>
                            <input type="text" id="extra-income-description" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="extra-income-amount">Monto:</label>
                            <input type="number" id="extra-income-amount" min="1" step="0.01" required>
                        </div>
                        
                        <button type="submit" class="btn-primary planning-btn">Agregar Ingreso Extra</button>
                    </form>
                </div>
                
                <div class="income-history">
                    <h3>Historial de Ingresos</h3>
                    <div id="income-history-list"></div>
                </div>
            </div>
        </div>
        
        <div class="tab-content" id="balance-tab">
            <div class="card">
                <h2>Saldo Disponible Mensual</h2>
                <div id="income-summary"></div>
            </div>
        </div>
        
        <div class="tab-content" id="register-tab">
            <div class="card">
                <h2>Nuevo Gasto Planificado</h2>
                <form id="planning-form">
                    <div class="form-group">
                        <label for="planning-name">Descripción del Gasto:</label>
                        <input type="text" id="planning-name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="planning-amount">Monto Estimado:</label>
                        <input type="number" id="planning-amount" min="1" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="planning-category">Categoría:</label>
                        <select id="planning-category" required>
                            <option value="">Seleccionar categoría</option>
                            <option value="hogar">Hogar</option>
                            <option value="transporte">Transporte</option>
                            <option value="alimentacion">Alimentación</option>
                            <option value="salud">Salud</option>
                            <option value="educacion">Educación</option>
                            <option value="entretenimiento">Entretenimiento</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="planning-priority">Prioridad:</label>
                        <select id="planning-priority" required>
                            <option value="">Seleccionar prioridad</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="planning-date">Fecha Estimada:</label>
                        <input type="date" id="planning-date" required>
                    </div>

                    <div class="form-group checkbox-container">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="recurring-expense">
                            <span class="checkmark"></span>
                            <span class="checkbox-label">Es un gasto fijo recurrente</span>
                        </label>
                    </div>

                    <div id="recurring-options" class="recurring-options">
                        <div class="form-group recurring-duration">
                            <label for="recurring-months">Repetir durante:</label>
                            <div class="recurring-input-group">
                                <input type="number" id="recurring-months" min="1" max="60" value="12">
                                <span class="recurring-unit">meses</span>
                            </div>
                        </div>
                        <p class="recurring-info">Este gasto se repetirá automáticamente cada mes durante el período seleccionado.</p>
                    </div>

                    <div class="form-group">
                        <label for="planning-notes">Notas Adicionales:</label>
                        <textarea id="planning-notes" rows="3"></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary planning-btn">Registrar Gasto</button>
                </form>
            </div>
        </div>
        
        <div class="tab-content" id="pending-tab">
            <div class="expenses-container">
                <h2>Gastos Pendientes</h2>
                <div class="planning-filters">
                    <div class="filter-group">
                        <label for="filter-category">Filtrar por Categoría:</label>
                        <select id="filter-category">
                            <option value="todos">Todos</option>
                            <option value="hogar">Hogar</option>
                            <option value="transporte">Transporte</option>
                            <option value="alimentacion">Alimentación</option>
                            <option value="salud">Salud</option>
                            <option value="educacion">Educación</option>
                            <option value="entretenimiento">Entretenimiento</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-priority">Filtrar por Prioridad:</label>
                        <select id="filter-priority">
                            <option value="todos">Todos</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>
                    <button id="apply-filters" class="btn-secondary">Aplicar Filtros</button>
                </div>
                <div id="planning-pending-list"></div>
            </div>
        </div>
        
        <div class="tab-content" id="completed-tab">
            <div class="expenses-container">
                <h2>Gastos Completados</h2>
                <div id="planning-completed-list"></div>
            </div>
        </div>
    </div>

<!-- Nuevas pestañas para Tarjeta de Crédito -->
<div class="tab-content" id="credit-summary-tab">
    <div class="nearest-payment-container card">
        <h2>Próximo Pago</h2>
        <div id="nearest-payment-summary"></div>
    </div>
    
    <div class="summary-container card">
        <h2>Resumen de Deuda</h2>
        <div id="debt-summary"></div>
    </div>
</div>

<div class="tab-content" id="credit-register-tab">
    <div class="card">
        <h2>Nuevo Gasto de Tarjeta</h2>
        <form id="expense-form">
            <div class="form-group">
                <label for="expense-name">Nombre del Gasto:</label>
                <input type="text" id="expense-name" required>
            </div>
            
            <div class="form-group">
                <label for="expense-amount">Monto Total:</label>
                <input type="number" id="expense-amount" min="1" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label for="expense-installments">Cantidad de Cuotas:</label>
                <input type="number" id="expense-installments" min="1" max="60" required>
            </div>
            
            <div class="form-group">
                <label for="payment-start-date">Fecha de Inicio de Pago:</label>
                <input type="date" id="payment-start-date" required>
            </div>
            
            <button type="submit" class="btn-primary">Registrar Gasto</button>
        </form>
    </div>
</div>

<div class="tab-content" id="credit-pending-tab">
    <div class="expenses-container">
        <h2>Cuotas Pendientes</h2>
        <div id="expenses-list"></div>
    </div>
</div>

<div class="tab-content" id="credit-completed-tab">
    <div class="expenses-container">
        <h2>Pagos Completados</h2>
        <div id="completed-expenses-list"></div>
    </div>
</div>

<div class="tab-content" id="statistics-tab">
  <div class="card">
    <h2>Estadísticas y Gráficos</h2>
    <div class="charts-container">
      <div class="chart-card">
        <h3>Distribución de Gastos por Categoría</h3>
        <div class="chart-wrapper">
          <canvas id="category-chart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3>Evolución de Gastos Mensuales</h3>
        <div class="chart-wrapper">
          <canvas id="monthly-chart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3>Comparativa Ingresos vs Gastos</h3>
        <div class="chart-wrapper">
          <canvas id="income-expense-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="tab-content" id="goals-tab">
  <div class="card">
    <h2>Metas de Ahorro</h2>
    <form id="savings-goal-form">
      <div class="form-group">
        <label for="goal-name">Nombre de la Meta:</label>
        <input type="text" id="goal-name" required placeholder="Ej: Vacaciones, Nuevo auto, etc.">
      </div>
      
      <div class="form-group">
        <label for="goal-amount">Monto Objetivo:</label>
        <input type="number" id="goal-amount" min="1" step="0.01" required>
      </div>
      
      <div class="form-group">
        <label for="goal-date">Fecha Objetivo:</label>
        <input type="date" id="goal-date" required>
      </div>
      
      <div class="form-group">
        <label for="goal-initial">Monto Inicial (opcional):</label>
        <input type="number" id="goal-initial" min="0" step="0.01" value="0">
      </div>
      
      <div class="form-group">
        <label for="goal-notes">Notas:</label>
        <textarea id="goal-notes" rows="3"></textarea>
      </div>
      
      <button type="submit" class="btn-primary">Crear Meta de Ahorro</button>
    </form>
    
    <div class="goals-container">
      <h3>Mis Metas de Ahorro</h3>
      <div id="savings-goals-list"></div>
    </div>
  </div>
</div>
</div>

<!-- Añadir después de la sección de tabs-container -->
<div class="tab-content" id="calendar-tab">
  <div class="card">
    <h2>Calendario Financiero</h2>
    <div class="calendar-controls">
      <button id="prev-month" class="btn-secondary"><i class="arrow left"></i> Mes Anterior</button>
      <h3 id="current-month-display">Mes Actual</h3>
      <button id="next-month" class="btn-secondary">Mes Siguiente <i class="arrow right"></i></button>
    </div>
    <div class="calendar-container">
      <div class="calendar-header">
        <div>Dom</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
      </div>
      <div id="calendar-grid" class="calendar-grid"></div>
    </div>
    <div id="day-details" class="day-details">
      <h3>Selecciona un día para ver detalles</h3>
    </div>
  </div>
</div>

<div class="tab-content" id="settings-tab">
  <div class="card">
    <h2>Configuración</h2>
    
    <div class="settings-section">
      <h3>Notificaciones</h3>
      <div class="form-group">
        <label class="toggle-switch">
          <input type="checkbox" id="notifications-enabled" checked>
          <span class="toggle-slider"></span>
          <span class="toggle-label">Habilitar notificaciones</span>
        </label>
      </div>
      
      <div id="notification-settings" class="notification-settings">
        <div class="form-group">
          <label class="toggle-switch">
            <input type="checkbox" id="payment-reminders" checked>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Recordatorios de pagos</span>
          </label>
          <div class="setting-detail">
            <label for="days-before-payment">Días de anticipación:</label>
            <input type="number" id="days-before-payment" min="1" max="30" value="3" class="small-input">
          </div>
        </div>
        
        <div class="form-group">
          <label class="toggle-switch">
            <input type="checkbox" id="low-balance-alerts" checked>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Alertas de saldo bajo</span>
          </label>
          <div class="setting-detail">
            <label for="low-balance-threshold">Umbral (%):</label>
            <input type="number" id="low-balance-threshold" min="5" max="50" value="20" class="small-input">
          </div>
        </div>
        
        <div class="form-group">
          <label class="toggle-switch">
            <input type="checkbox" id="goal-reminders" checked>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Recordatorios de metas de ahorro</span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>Exportar Datos</h3>
      <p>Descarga tus datos financieros para hacer copias de seguridad o análisis externos.</p>
      <div class="export-buttons">
        <button id="export-all" class="btn-primary">Exportar Todos los Datos</button>
        <button id="export-expenses" class="btn-secondary">Exportar Gastos</button>
        <button id="export-incomes" class="btn-secondary">Exportar Ingresos</button>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>Tema</h3>
      <div class="theme-options">
        <button id="theme-light" class="theme-button active">
          <div class="theme-preview light"></div>
          <span>Claro</span>
        </button>
        <button id="theme-dark" class="theme-button">
          <div class="theme-preview dark"></div>
          <span>Oscuro</span>
        </button>
        <button id="theme-system" class="theme-button">
          <div class="theme-preview system"></div>
          <span>Sistema</span>
        </button>
      </div>
    </div>
    
    <button id="save-settings" class="btn-primary">Guardar Configuración</button>
  </div>
</div>

<!-- Confirmation Modal -->
<div id="planning-delete-modal" class="modal">
    <div class="modal-content">
        <span class="close-delete">&times;</span>
        <h2>Confirmar Eliminación</h2>
        <div id="planning-delete-details"></div>
        <div class="modal-buttons">
            <button id="planning-cancel-delete" class="btn-secondary">Cancelar</button>
            <button id="planning-confirm-delete" class="btn-danger">Eliminar</button>
        </div>
    </div>
</div>

<!-- Success Modal -->
<div id="success-modal" class="modal">
    <div class="modal-content success-modal-content">
        <span class="close-success">&times;</span>
        <div class="success-icon">✓</div>
        <h2 id="success-title">Operación Exitosa</h2>
        <p id="success-message">La operación se ha completado correctamente.</p>
        <button id="success-ok" class="btn-primary">Aceptar</button>
    </div>
</div>

<!-- Añadir modal de notificaciones -->
<div id="notifications-modal" class="modal">
  <div class="modal-content notifications-modal-content">
    <span class="close-modal">&times;</span>
    <h2>Notificaciones</h2>
    <div class="notifications-header">
      <button id="mark-all-read" class="btn-secondary">Marcar todas como leídas</button>
      <button id="clear-notifications" class="btn-danger">Borrar todas</button>
    </div>
    <div id="notifications-list" class="notifications-list">
      <p class="no-notifications">No tienes notificaciones.</p>
    </div>
  </div>
</div>

<!-- Payment Modal -->
<div id="payment-modal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Registrar Pago</h2>
        <div id="payment-details"></div>
        <button id="confirm-payment" class="btn-primary">Confirmar Pago</button>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="delete-modal" class="modal">
    <div class="modal-content">
        <span class="close-delete">&times;</span>
        <h2>Confirmar Eliminación</h2>
        <div id="delete-details"></div>
        <div class="modal-buttons">
            <button id="cancel-delete" class="btn-secondary">Cancelar</button>
            <button id="confirm-delete" class="btn-danger">Eliminar</button>
        </div>
    </div>
</div>

<script src="planificacion.js"></script>
<script src="chart.js"></script>
<script src="statistics.js"></script>
<script src="savings-goals.js"></script>
<script src="calendar.js"></script>
<script src="notifications.js"></script>
<script src="settings.js"></script>
</body>
</html>

