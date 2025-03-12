// DOM Elements
const expenseForm = document.getElementById("expense-form")
const expensesList = document.getElementById("expenses-list")
const completedExpensesList = document.getElementById("completed-expenses-list")
const debtSummary = document.getElementById("debt-summary")
const nearestPaymentSummary = document.getElementById("nearest-payment-summary")
const paymentModal = document.getElementById("payment-modal")
const closePaymentModal = document.querySelector(".close")
const paymentDetails = document.getElementById("payment-details")
const confirmPayment = document.getElementById("confirm-payment")

// Delete modal elements
const deleteModal = document.getElementById("delete-modal")
const closeDeleteModal = document.querySelector(".close-delete")
const deleteDetails = document.getElementById("delete-details")
const confirmDelete = document.getElementById("confirm-delete")
const cancelDelete = document.getElementById("cancel-delete")

// Global variables
let expenses = JSON.parse(localStorage.getItem("expenses")) || []
let currentInstallment = null
let currentExpenseToDelete = null

// Format currency with thousand separators (using dots)
function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.")
}

// Initialize the app
function init() {
  // Set default payment start date to today
  document.getElementById("payment-start-date").valueAsDate = new Date()

  // Initialize tabs
  initializeTabs()

  renderExpenses()
  updateDebtSummary()

  // Event listeners
  expenseForm.addEventListener("submit", addExpense)

  // Payment modal events
  closePaymentModal.addEventListener("click", () => (paymentModal.style.display = "none"))
  confirmPayment.addEventListener("click", processPayment)

  // Delete modal events
  closeDeleteModal.addEventListener("click", () => (deleteModal.style.display = "none"))
  confirmDelete.addEventListener("click", () => {
    if (currentExpenseToDelete) {
      deleteExpense(currentExpenseToDelete)
      deleteModal.style.display = "none"
      currentExpenseToDelete = null
    }
  })
  cancelDelete.addEventListener("click", () => {
    deleteModal.style.display = "none"
    currentExpenseToDelete = null
  })

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === paymentModal) {
      paymentModal.style.display = "none"
    }
    if (e.target === deleteModal) {
      deleteModal.style.display = "none"
      currentExpenseToDelete = null
    }
  })
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

// Add a new expense
function addExpense(e) {
  e.preventDefault()

  const name = document.getElementById("expense-name").value
  const amount = Number.parseFloat(document.getElementById("expense-amount").value)
  const installmentsCount = Number.parseInt(document.getElementById("expense-installments").value)
  const startDateStr = document.getElementById("payment-start-date").value

  if (!name || isNaN(amount) || isNaN(installmentsCount) || !startDateStr || amount <= 0 || installmentsCount <= 0) {
    alert("Por favor, complete todos los campos correctamente.")
    return
  }

  const installmentAmount = amount / installmentsCount
  const currentDate = new Date()
  const startDate = new Date(startDateStr)

  const installments = []
  for (let i = 0; i < installmentsCount; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(startDate.getMonth() + i)

    installments.push({
      number: i + 1,
      amount: installmentAmount.toFixed(2),
      dueDate: dueDate.toISOString().split("T")[0],
      paid: false,
      paymentDate: null,
    })
  }

  const expense = {
    id: Date.now().toString(),
    name,
    amount,
    installmentsCount,
    createdAt: currentDate.toISOString(),
    startDate: startDate.toISOString(),
    installments,
  }

  expenses.push(expense)
  saveExpenses()
  renderExpenses()
  updateDebtSummary()
  expenseForm.reset()
  document.getElementById("payment-start-date").valueAsDate = new Date()

  // Switch to summary tab after adding expense
  const summaryTabButton = document.querySelector('.tab-button[data-tab="summary"]')
  if (summaryTabButton) {
    summaryTabButton.click()
  }
}

// Save expenses to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses))
}

// Render all expenses
function renderExpenses() {
  // Clear both lists
  expensesList.innerHTML = ""
  completedExpensesList.innerHTML = ""

  if (expenses.length === 0) {
    expensesList.innerHTML = '<p class="no-expenses">No hay gastos registrados.</p>'
    completedExpensesList.innerHTML = '<p class="no-expenses">No hay gastos completados.</p>'
    return
  }

  let hasActiveExpenses = false
  let hasCompletedExpenses = false

  expenses.forEach((expense) => {
    // Check if all installments are paid
    const allPaid = expense.installments.every((inst) => inst.paid)

    const expenseCard = document.createElement("div")
    expenseCard.className = allPaid ? "completed-expense-card" : "expense-card"

    const createdDate = new Date(expense.createdAt)
    const formattedDate = createdDate.toLocaleDateString()

    const paidInstallments = expense.installments.filter((inst) => inst.paid).length
    const totalInstallments = expense.installments.length
    const paidAmount = expense.installments
      .filter((inst) => inst.paid)
      .reduce((sum, inst) => sum + Number.parseFloat(inst.amount), 0)
    const pendingAmount = expense.amount - paidAmount

    // Create the header (always visible)
    // Dentro de la función renderExpenses(), reemplaza la creación del expenseHeader con esto:
const expenseHeader = document.createElement("div")
expenseHeader.className = allPaid ? "completed-expense-header" : "expense-header"

// Calcula el porcentaje de progreso
const progressPercentage = (paidInstallments / totalInstallments) * 100

expenseHeader.innerHTML = `
  <div class="expense-title-container">
    <span class="expense-toggle">▶</span>
    <div class="expense-title">${expense.name}</div>
  </div>
  <div class="expense-summary">
    <div class="progress-container">
      <div class="progress-text">Cuotas: ${paidInstallments}/${totalInstallments}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
    </div>
    <div class="expense-amount">${
      allPaid ? "Pagado: $" + formatCurrency(expense.amount) : "Pendiente: $" + formatCurrency(pendingAmount)
    }</div>
    <div class="expense-actions">
      <button class="delete-button" onclick="confirmDeleteExpense('${expense.id}', event)">Eliminar</button>
    </div>
  </div>
`

    // Create the content (collapsible)
    const expenseContent = document.createElement("div")
    expenseContent.className = "expense-content"
    expenseContent.innerHTML = `
            <div class="expense-date">Registrado: ${formattedDate}</div>
            <div class="expense-details">
                <div class="expense-detail"><strong>Monto Total:</strong> $${formatCurrency(expense.amount)}</div>
                <div class="expense-detail"><strong>Cuotas:</strong> ${paidInstallments} pagadas de ${totalInstallments}</div>
                <div class="expense-detail"><strong>Valor de Cuota:</strong> $${formatCurrency(expense.amount / expense.installmentsCount)}</div>
                <div class="expense-detail"><strong>Inicio de Pago:</strong> ${new Date(expense.startDate).toLocaleDateString()}</div>
            </div>
            <table class="installments-table">
                <thead>
                    <tr>
                        <th>Cuota</th>
                        <th>Vencimiento</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderInstallments(expense)}
                </tbody>
            </table>
        `

    expenseCard.appendChild(expenseHeader)
    expenseCard.appendChild(expenseContent)

    // Add toggle functionality
    expenseHeader.addEventListener("click", () => {
      const toggle = expenseHeader.querySelector(".expense-toggle")
      toggle.classList.toggle("open")
      expenseContent.classList.toggle("open")
    })

    // Add to appropriate list
    if (allPaid) {
      completedExpensesList.appendChild(expenseCard)
      hasCompletedExpenses = true
    } else {
      expensesList.appendChild(expenseCard)
      hasActiveExpenses = true
    }
  })

  // Show messages if no expenses in either category
  if (!hasActiveExpenses) {
    expensesList.innerHTML = '<p class="no-expenses">No hay gastos activos.</p>'
  }

  if (!hasCompletedExpenses) {
    completedExpensesList.innerHTML = '<p class="no-expenses">No hay gastos completados.</p>'
  }
}

// Render installments for an expense
function renderInstallments(expense) {
  return expense.installments
    .map((installment) => {
      const dueDate = new Date(installment.dueDate)
      const formattedDueDate = dueDate.toLocaleDateString()

      let status, paymentInfo, buttonState

      if (installment.paid) {
        const paymentDate = new Date(installment.paymentDate)
        status = `<span class="status-paid">Pagado</span>`
        paymentInfo = ` (${paymentDate.toLocaleDateString()})`
        buttonState = "disabled"
      } else {
        status = `<span class="status-pending">Pendiente</span>`
        paymentInfo = ""
        buttonState = ""
      }

      return `
        <tr>
          <td class="installments-table-header" data-label="Cuota">Cuota ${installment.number}</td>
          <td data-label="Vencimiento">${formattedDueDate}</td>
          <td data-label="Monto">$${formatCurrency(Number.parseFloat(installment.amount))}</td>
          <td data-label="Estado">${status}${paymentInfo}</td>
          <td>
            <button class="pay-button" ${buttonState} 
              onclick="openPaymentModal('${expense.id}', ${installment.number - 1})">
              ${installment.paid ? "Pagado" : "Pagar"}
            </button>
          </td>
        </tr>
      `
    })
    .join("")
}

// Update debt summary
function updateDebtSummary() {
  if (expenses.length === 0) {
    debtSummary.innerHTML = "<p>No hay gastos registrados.</p>"
    nearestPaymentSummary.innerHTML = "<p>No hay pagos pendientes.</p>"
    return
  }

  // Calculate total pending debt
  let totalPendingDebt = 0
  let totalPaidDebt = 0

  // Group installments by month for monthly payments
  const monthlyPayments = {}

  // Collect all unpaid installments
  const unpaidInstallments = []

  expenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      const amount = Number.parseFloat(installment.amount)

      if (installment.paid) {
        totalPaidDebt += amount
      } else {
        totalPendingDebt += amount

        // Add to unpaid installments array
        unpaidInstallments.push({
          expenseName: expense.name,
          ...installment,
          dueDate: new Date(installment.dueDate),
        })

        // Group by month for monthly payments
        const dueDate = new Date(installment.dueDate)
        const monthYear = `${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`

        if (!monthlyPayments[monthYear]) {
          monthlyPayments[monthYear] = {
            month: dueDate.toLocaleString("default", { month: "long" }),
            year: dueDate.getFullYear(),
            amount: 0,
            date: dueDate,
            expenses: [],
          }
        }

        monthlyPayments[monthYear].amount += amount
        monthlyPayments[monthYear].expenses.push({
          name: expense.name,
          installmentNumber: installment.number,
          totalInstallments: expense.installmentsCount,
          amount: amount,
        })
      }
    })
  })

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyPayments).sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number)
    const [monthB, yearB] = b.split("/").map(Number)

    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  // Create summary HTML for the top part
  const summaryHTML = `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-title">Deuda Total Pendiente</div>
                <div class="summary-amount">$${formatCurrency(totalPendingDebt)}</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Total Pagado</div>
                <div class="summary-amount positive">$${formatCurrency(totalPaidDebt)}</div>
            </div>
        </div>
  `

  // Clear and set the debt summary
  debtSummary.innerHTML = summaryHTML

  // Create monthly payments section
  const monthlyPaymentsSection = document.createElement("div")
  monthlyPaymentsSection.className = "monthly-payments"
  monthlyPaymentsSection.innerHTML = "<h3>Pagos Mensuales</h3>"

  if (sortedMonths.length === 0) {
    monthlyPaymentsSection.innerHTML += "<p>No hay pagos pendientes.</p>"
  } else {
    sortedMonths.forEach((monthYear) => {
      const { month, year, amount, expenses: monthlyExpenses } = monthlyPayments[monthYear]

      // Sort expenses by amount (highest first)
      monthlyExpenses.sort((a, b) => b.amount - a.amount)

      // Create monthly payment item
      const monthlyItem = document.createElement("div")
      monthlyItem.className = "monthly-payment-item"

      // Create header
      const header = document.createElement("div")
      header.className = "monthly-payment-header"
      header.innerHTML = `
                <span class="monthly-payment-toggle">▶</span>
                <span class="monthly-payment-month">${month} ${year}</span>
                <span><strong>$ ${formatCurrency(amount)}</strong></span>
            `

      // Create details container
      const details = document.createElement("div")
      details.className = "monthly-payment-details"

      // Add expense details
      monthlyExpenses.forEach((exp) => {
        const expenseItem = document.createElement("div")
        expenseItem.className = "monthly-expense-item"
        expenseItem.innerHTML = `
                    <span class="monthly-expense-name">${exp.name} (Cuota ${exp.installmentNumber}/${exp.totalInstallments})</span>
                    <span class="monthly-expense-amount">$${formatCurrency(exp.amount)}</span>
                `
        details.appendChild(expenseItem)
      })

      // Add click handler to toggle details
      header.addEventListener("click", function () {
        const toggle = this.querySelector(".monthly-payment-toggle")
        toggle.classList.toggle("open")
        details.classList.toggle("open")
      })

      // Append elements
      monthlyItem.appendChild(header)
      monthlyItem.appendChild(details)

      // Add to container
      monthlyPaymentsSection.appendChild(monthlyItem)
    })
  }

  // Append the monthly payments section to the debt summary
  debtSummary.appendChild(monthlyPaymentsSection)

  // Handle nearest payment summary
  if (unpaidInstallments.length === 0) {
    nearestPaymentSummary.innerHTML = "<p>No hay pagos pendientes.</p>"
    return
  }

  // Sort installments by due date
  unpaidInstallments.sort((a, b) => a.dueDate - b.dueDate)

  // Get the nearest month
  const nearestDate = unpaidInstallments[0].dueDate
  const nearestMonth = nearestDate.getMonth()
  const nearestYear = nearestDate.getFullYear()

  // Filter installments for the nearest month
  const nearestInstallments = unpaidInstallments.filter(
    (inst) => inst.dueDate.getMonth() === nearestMonth && inst.dueDate.getFullYear() === nearestYear,
  )

  // Calculate total for nearest month
  const nearestTotal = nearestInstallments.reduce((sum, inst) => sum + Number.parseFloat(inst.amount), 0)

  // Format the nearest month name
  const nearestMonthName = nearestDate.toLocaleString("default", { month: "long" })

  // Create nearest payment HTML
  let nearestHTML = `
        <div class="nearest-payment-date">Vencimiento: ${nearestMonthName} ${nearestYear}</div>
        <div class="nearest-payment-amount">Total a pagar: <br> <strong>$ ${formatCurrency(nearestTotal)}</strong></div>
        <div class="nearest-payment-items">
            <h3>Detalle de cuotas:</h3>
    `

  nearestInstallments.forEach((inst) => {
    nearestHTML += `
            <div class="nearest-payment-item">
                <div>${inst.expenseName} - Cuota ${inst.number}</div>
                <div><strong>$ ${formatCurrency(Number.parseFloat(inst.amount))}</strong></div>
            </div>
        `
  })

  nearestHTML += "</div>"
  nearestPaymentSummary.innerHTML = nearestHTML
}

// Open payment modal
function openPaymentModal(expenseId, installmentIndex) {
  const expense = expenses.find((exp) => exp.id === expenseId)
  if (!expense) return

  const installment = expense.installments[installmentIndex]
  if (!installment || installment.paid) return

  currentInstallment = { expenseId, installmentIndex }

  const dueDate = new Date(installment.dueDate)

  paymentDetails.innerHTML = `
        <p class="detail-to-pay"><strong>Gasto:</strong> ${expense.name}</p>
        <p class="detail-to-pay"><strong>Cuota:</strong> ${installment.number} de ${expense.installmentsCount}</p>
        <p class="detail-to-pay"><strong>Monto:</strong> $${formatCurrency(Number.parseFloat(installment.amount))}</p>
        <p class="detail-to-pay"><strong>Vencimiento:</strong> ${dueDate.toLocaleDateString()}</p>
        <p class="detail-to-pay"><strong>Fecha de Pago:</strong> ${new Date().toLocaleDateString()}</p>
        <p class="advert"> Una vez confirmado no podrás revertir este pago.</p>
    `

  paymentModal.style.display = "block"
}

// Process payment
function processPayment() {
  if (!currentInstallment) return

  const { expenseId, installmentIndex } = currentInstallment
  const expenseIndex = expenses.findIndex((exp) => exp.id === expenseId)

  if (expenseIndex === -1) return

  expenses[expenseIndex].installments[installmentIndex].paid = true
  expenses[expenseIndex].installments[installmentIndex].paymentDate = new Date().toISOString()

  saveExpenses()
  renderExpenses()
  updateDebtSummary()
  paymentModal.style.display = "none"
  currentInstallment = null
}

// Confirm delete expense
function confirmDeleteExpense(expenseId, event) {
  // Stop the click event from propagating to the parent (which would toggle the expense)
  event.stopPropagation()

  const expense = expenses.find((exp) => exp.id === expenseId)
  if (!expense) return

  const isCompleted = expense.installments.every((inst) => inst.paid)
  const status = isCompleted ? "completado" : "activo"

  // Set the current expense to delete
  currentExpenseToDelete = expenseId

  // Show delete confirmation modal
  deleteDetails.innerHTML = `
    <p>¿Estás seguro que deseas eliminar el gasto <span class="expense-name-highlight">${expense.name}</span>?</p>
    <p>Este es un gasto <strong>${status}</strong> ${isCompleted ? "que ya ha sido pagado en su totalidad" : "con pagos pendientes"}.</p>
    <p>Esta acción no se puede deshacer.</p>
  `

  deleteModal.style.display = "block"
}

// Delete expense
function deleteExpense(expenseId) {
  expenses = expenses.filter((expense) => expense.id !== expenseId)
  saveExpenses()
  renderExpenses()
  updateDebtSummary()
}

// Make functions available globally
window.openPaymentModal = openPaymentModal
window.confirmDeleteExpense = confirmDeleteExpense

// Initialize the app
init()

