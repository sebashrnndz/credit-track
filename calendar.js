// DOM Elements
const calendarGrid = document.getElementById("calendar-grid")
const currentMonthDisplay = document.getElementById("current-month-display")
const prevMonthBtn = document.getElementById("prev-month")
const nextMonthBtn = document.getElementById("next-month")
const dayDetails = document.getElementById("day-details")

// Global variables
const currentDate = new Date()
let currentMonth = currentDate.getMonth()
let currentYear = currentDate.getFullYear()

// Initialize calendar
function initCalendar() {
  console.log("Inicializando calendario...");
  
  // Verificar que los elementos DOM existan
  if (!calendarGrid || !currentMonthDisplay || !prevMonthBtn || !nextMonthBtn || !dayDetails) {
    console.error("Elementos del calendario no encontrados. Verifica los IDs en el HTML.");
    return;
  }

  // Event listeners
  prevMonthBtn.addEventListener("click", () => {
    navigateMonth(-1)
  })

  nextMonthBtn.addEventListener("click", () => {
    navigateMonth(1)
  })

  // Render calendar
  renderCalendar()
  console.log("Calendario inicializado correctamente");
}

// Navigate to previous/next month
function navigateMonth(direction) {
  currentMonth += direction

  if (currentMonth < 0) {
    currentMonth = 11
    currentYear--
  } else if (currentMonth > 11) {
    currentMonth = 0
    currentYear++
  }

  renderCalendar()
}

// Render calendar
function renderCalendar() {
  // Update month display
  currentMonthDisplay.textContent = new Date(currentYear, currentMonth, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  // Clear grid
  calendarGrid.innerHTML = ""

  // Get first day of month and total days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get financial events for this month
  const events = getMonthEvents(currentYear, currentMonth)

  // Create empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div")
    emptyCell.className = "calendar-day empty"
    calendarGrid.appendChild(emptyCell)
  }

  // Create cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div")
    dayCell.className = "calendar-day"

    // Check if this is today
    const isToday =
      currentDate.getDate() === day &&
      currentDate.getMonth() === currentMonth &&
      currentDate.getFullYear() === currentYear

    if (isToday) {
      dayCell.classList.add("today")
    }

    // Get events for this day
    const dayEvents = events.filter((event) => event.day === day)
    const hasEvents = dayEvents.length > 0

    if (hasEvents) {
      dayCell.classList.add("has-events")

      // Calculate total amount for the day
      const totalAmount = dayEvents.reduce((sum, event) => sum + event.amount, 0)

      // Add event indicators
      const indicators = document.createElement("div")
      indicators.className = "event-indicators"

      // Group by type
      const hasExpenses = dayEvents.some((event) => event.type === "expense")
      const hasIncomes = dayEvents.some((event) => event.type === "income")
      const hasGoals = dayEvents.some((event) => event.type === "goal")
      const hasCreditCard = dayEvents.some((event) => event.type === "credit-card")

      if (hasExpenses) {
        const indicator = document.createElement("span")
        indicator.className = "indicator expense"
        indicators.appendChild(indicator)
      }

      if (hasIncomes) {
        const indicator = document.createElement("span")
        indicator.className = "indicator income"
        indicators.appendChild(indicator)
      }

      if (hasGoals) {
        const indicator = document.createElement("span")
        indicator.className = "indicator goal"
        indicators.appendChild(indicator)
      }

      if (hasCreditCard) {
        const indicator = document.createElement("span")
        indicator.className = "indicator credit-card"
        indicators.appendChild(indicator)
      }

      // Add amount
      const amountEl = document.createElement("div")
      amountEl.className = "day-amount " + (totalAmount >= 0 ? "positive" : "negative")
      amountEl.textContent = formatCurrency(Math.abs(totalAmount))

      dayCell.appendChild(indicators)
      dayCell.appendChild(amountEl)
    }

    // Add day number
    const dayNumber = document.createElement("div")
    dayNumber.className = "day-number"
    dayNumber.textContent = day
    dayCell.appendChild(dayNumber)

    // Add click event to show details
    dayCell.addEventListener("click", () => {
      showDayDetails(day, dayEvents)

      // Remove selected class from all days
      document.querySelectorAll(".calendar-day").forEach((cell) => {
        cell.classList.remove("selected")
      })

      // Add selected class to clicked day
      dayCell.classList.add("selected")
    })

    calendarGrid.appendChild(dayCell)
  }
}

// Show details for a specific day
function showDayDetails(day, events) {
  const date = new Date(currentYear, currentMonth, day)
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let html = `
    <h3>${formattedDate}</h3>
  `

  if (events.length === 0) {
    html += `<p class="no-events">No hay eventos financieros para este día.</p>`
  } else {
    // Group events by type
    const expenses = events.filter((event) => event.type === "expense")
    const incomes = events.filter((event) => event.type === "income")
    const goals = events.filter((event) => event.type === "goal")
    const creditCards = events.filter((event) => event.type === "credit-card")

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, event) => sum + event.amount, 0)
    const totalIncomes = incomes.reduce((sum, event) => sum + event.amount, 0)
    const totalGoals = goals.reduce((sum, event) => sum + event.amount, 0)
    const totalCreditCards = creditCards.reduce((sum, event) => sum + event.amount, 0)

    const netAmount = totalIncomes - totalExpenses - totalGoals - totalCreditCards

    html += `
      <div class="day-summary">
        <div class="day-balance ${netAmount >= 0 ? "positive" : "negative"}">
          Balance del día: ${netAmount >= 0 ? "+" : ""}$${formatCurrency(netAmount)}
        </div>
      </div>
    `

    // Render expenses
    if (expenses.length > 0) {
      html += `
        <div class="event-section expense-section">
          <h4>Gastos Planificados</h4>
          <div class="event-list">
      `

      expenses.forEach((event) => {
        html += `
          <div class="event-item">
            <div class="event-title">${event.title}</div>
            <div class="event-amount">$${formatCurrency(event.amount)}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ""}
            <div class="event-actions">
              <button class="btn-secondary btn-sm" onclick="navigateToEvent('${event.type}', '${event.id}')">Ver Detalles</button>
            </div>
          </div>
        `
      })

      html += `
          </div>
          <div class="event-total">Total: $${formatCurrency(totalExpenses)}</div>
        </div>
      `
    }

    // Render credit card payments
    if (creditCards.length > 0) {
      html += `
        <div class="event-section credit-card-section">
          <h4>Pagos de Tarjeta de Crédito</h4>
          <div class="event-list">
      `

      creditCards.forEach((event) => {
        html += `
          <div class="event-item">
            <div class="event-title">${event.title}</div>
            <div class="event-amount">$${formatCurrency(event.amount)}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ""}
            <div class="event-actions">
              <button class="btn-secondary btn-sm" onclick="navigateToEvent('${event.type}', '${event.id}')">Ver Detalles</button>
            </div>
          </div>
        `
      })

      html += `
          </div>
          <div class="event-total">Total: $${formatCurrency(totalCreditCards)}</div>
        </div>
      `
    }

    // Render incomes
    if (incomes.length > 0) {
      html += `
        <div class="event-section income-section">
          <h4>Ingresos</h4>
          <div class="event-list">
      `

      incomes.forEach((event) => {
        html += `
          <div class="event-item">
            <div class="event-title">${event.title}</div>
            <div class="event-amount positive">+$${formatCurrency(event.amount)}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ""}
            <div class="event-actions">
              <button class="btn-secondary btn-sm" onclick="navigateToEvent('${event.type}', '${event.id}')">Ver Detalles</button>
            </div>
          </div>
        `
      })

      html += `
          </div>
          <div class="event-total positive">Total: +$${formatCurrency(totalIncomes)}</div>
        </div>
      `
    }

    // Render goals
    if (goals.length > 0) {
      html += `
        <div class="event-section goal-section">
          <h4>Metas de Ahorro</h4>
          <div class="event-list">
      `

      goals.forEach((event) => {
        html += `
          <div class="event-item">
            <div class="event-title">${event.title}</div>
            <div class="event-amount">$${formatCurrency(event.amount)}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ""}
            <div class="event-actions">
              <button class="btn-secondary btn-sm" onclick="navigateToEvent('${event.type}', '${event.id}')">Ver Detalles</button>
            </div>
          </div>
        `
      })

      html += `
          </div>
          <div class="event-total">Total: $${formatCurrency(totalGoals)}</div>
        </div>
      `
    }
  }

  dayDetails.innerHTML = html
}

// Get all financial events for a specific month
function getMonthEvents(year, month) {
  const events = []

  // Get planned expenses
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  plannedExpenses.forEach((expense) => {
    const expenseDate = new Date(expense.date)

    if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
      events.push({
        id: expense.id,
        type: "expense",
        day: expenseDate.getDate(),
        title: expense.name,
        amount: expense.amount,
        description: `Categoría: ${getCategoryText(expense.category)}, Prioridad: ${getPriorityText(expense.priority)}`,
        completed: expense.completed,
      })
    }
  })

  // Get credit card expenses
  const creditCardExpenses = JSON.parse(localStorage.getItem("expenses")) || []

  creditCardExpenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      if (!installment.paid) {
        const dueDate = new Date(installment.dueDate)

        if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
          events.push({
            id: expense.id,
            type: "credit-card",
            day: dueDate.getDate(),
            title: `${expense.name} - Cuota ${installment.number}/${expense.installmentsCount}`,
            amount: Number.parseFloat(installment.amount),
            description: "Pago de tarjeta de crédito",
          })
        }
      }
    })
  })

  // Get incomes
  const monthlyIncomes = JSON.parse(localStorage.getItem("monthlyIncomes")) || []
  const extraIncomes = JSON.parse(localStorage.getItem("extraIncomes")) || []

  // Assume monthly income is received on the 5th of each month
  monthlyIncomes.forEach((income) => {
    const [incomeYear, incomeMonth] = income.month.split("-").map(Number)

    if (incomeYear === year && incomeMonth - 1 === month) {
      events.push({
        id: income.id,
        type: "income",
        day: 5, // Assuming income is received on the 5th
        title: "Sueldo Mensual",
        amount: income.amount,
        description: income.notes || "Ingreso mensual regular",
      })
    }
  })

  // Extra incomes (assume they're received on the date they were created)
  extraIncomes.forEach((income) => {
    const [incomeYear, incomeMonth] = income.month.split("-").map(Number)
    const createdDate = new Date(income.createdAt)

    if (incomeYear === year && incomeMonth - 1 === month) {
      events.push({
        id: income.id,
        type: "income",
        day: createdDate.getDate(),
        title: income.description,
        amount: income.amount,
        description: "Ingreso extra",
      })
    }
  })

  // Get savings goals target dates
  const savingsGoals = JSON.parse(localStorage.getItem("savingsGoals")) || []

  savingsGoals.forEach((goal) => {
    const targetDate = new Date(goal.targetDate)

    if (targetDate.getFullYear() === year && targetDate.getMonth() === month) {
      events.push({
        id: goal.id,
        type: "goal",
        day: targetDate.getDate(),
        title: `Meta: ${goal.name}`,
        amount: goal.targetAmount - goal.currentAmount,
        description: `Fecha objetivo para completar la meta de ahorro`,
      })
    }

    // Also add contributions
    goal.contributions.forEach((contribution) => {
      const contribDate = new Date(contribution.date)

      if (contribDate.getFullYear() === year && contribDate.getMonth() === month) {
        events.push({
          id: goal.id,
          type: "goal",
          day: contribDate.getDate(),
          title: `Contribución a ${goal.name}`,
          amount: contribution.amount,
          description: contribution.notes || "Contribución a meta de ahorro",
        })
      }
    })
  })

  return events
}

// Navigate to the specific event details page
function navigateToEvent(type, id) {
  // Switch to the appropriate tab and scroll to the event
  switch (type) {
    case "expense":
      navigateToTab("pending", () => {
        const element = document.querySelector(`[data-expense-id="${id}"]`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
          // Highlight the element temporarily
          element.classList.add("highlight")
          setTimeout(() => {
            element.classList.remove("highlight")
          }, 2000)
        }
      })
      break

    case "credit-card":
      // Navigate to credit card expenses tab
      window.location.href = "app.html"
      break

    case "income":
      navigateToTab("income", () => {
        // Scroll to income history
        const incomeHistory = document.getElementById("income-history-list")
        if (incomeHistory) {
          incomeHistory.scrollIntoView({ behavior: "smooth" })
        }
      })
      break

    case "goal":
      navigateToTab("goals", () => {
        const element = document.querySelector(`[data-goal-id="${id}"]`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
          // Highlight the element temporarily
          element.classList.add("highlight")
          setTimeout(() => {
            element.classList.remove("highlight")
          }, 2000)
        }
      })
      break
  }
}

// Navigate to a specific tab
function navigateToTab(tabName, callback) {
  const tabButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`)
  if (tabButton) {
    tabButton.click()

    // Wait for tab content to be visible
    setTimeout(() => {
      if (callback) callback()
    }, 100)
  }
}

// Helper functions
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

function getPriorityText(priority) {
  const priorities = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  }
  return priorities[priority] || priority
}

function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.")
}

// Make functions available globally
window.navigateToEvent = navigateToEvent;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, configurando listeners para calendario");
  
  // Inicializar inmediatamente si estamos en la pestaña de calendario
  const calendarTab = document.querySelector('.tab-button[data-tab="calendar"]');
  if (calendarTab && calendarTab.classList.contains("active")) {
    console.log("Pestaña de calendario activa al cargar");
    setTimeout(initCalendar, 100);
  }
  
  // Inicializar cuando se hace clic en la pestaña de calendario
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.dataset.tab === "calendar") {
        console.log("Pestaña de calendario seleccionada");
        setTimeout(initCalendar, 100);
      }
    });
  });
  
  // También inicializar cuando se hace clic en un elemento del menú compacto
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function() {
      if (this.dataset.tab === "calendar") {
        console.log("Elemento de menú calendario seleccionado");
        setTimeout(initCalendar, 100);
      }
    });
  });
});