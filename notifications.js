// Sistema de notificaciones y recordatorios

// Configuración de notificaciones
const notificationSettings = JSON.parse(localStorage.getItem("notificationSettings")) || {
  enabled: true,
  paymentReminders: true,
  daysBeforePayment: 3,
  lowBalanceAlerts: true,
  lowBalanceThreshold: 20, // Porcentaje
  goalReminders: true,
}

// Guardar configuración
function saveNotificationSettings() {
  localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings))
}

// Inicializar notificaciones
function initNotifications() {
  console.log("Inicializando sistema de notificaciones...")

  // Verificar si las notificaciones están habilitadas
  if (!notificationSettings.enabled) {
    console.log("Notificaciones deshabilitadas en la configuración")
    return
  }

  // Verificar si el navegador soporta notificaciones
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones de escritorio")
    return
  }

  // Solicitar permiso si es necesario
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    console.log("Solicitando permiso para notificaciones...")
    Notification.requestPermission().then((permission) => {
      console.log("Permiso de notificación:", permission)
    })
  }

  // Comprobar notificaciones pendientes
  checkForNotifications()

  // Programar comprobación diaria
  setInterval(checkForNotifications, 86400000) // 24 horas

  console.log("Sistema de notificaciones inicializado")
}

// Comprobar notificaciones pendientes
function checkForNotifications() {
  if (!notificationSettings.enabled || Notification.permission !== "granted") return

  // Obtener fecha actual
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Comprobar recordatorios de pagos
  if (notificationSettings.paymentReminders) {
    checkPaymentReminders(today)
  }

  // Comprobar alertas de saldo bajo
  if (notificationSettings.lowBalanceAlerts) {
    checkLowBalanceAlerts(today)
  }

  // Comprobar recordatorios de metas
  if (notificationSettings.goalReminders) {
    checkGoalReminders(today)
  }
}

// Comprobar recordatorios de pagos
function checkPaymentReminders(today) {
  // Obtener gastos de tarjeta de crédito
  const creditCardExpenses = JSON.parse(localStorage.getItem("expenses")) || []

  // Obtener gastos planificados
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  // Días de anticipación para notificar
  const daysBeforePayment = notificationSettings.daysBeforePayment

  // Comprobar pagos de tarjeta de crédito
  creditCardExpenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      if (!installment.paid) {
        const dueDate = new Date(installment.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))

        if (daysUntilDue === daysBeforePayment) {
          showNotification(
            "Recordatorio de Pago",
            `El pago de ${expense.name} (Cuota ${installment.number}/${expense.installmentsCount}) vence en ${daysBeforePayment} días.`,
            { type: "credit-card", id: expense.id },
          )
        }
      }
    })
  })

  // Comprobar gastos planificados
  plannedExpenses.forEach((expense) => {
    if (!expense.completed) {
      const dueDate = new Date(expense.date)
      dueDate.setHours(0, 0, 0, 0)

      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))

      if (daysUntilDue === daysBeforePayment) {
        showNotification(
          "Recordatorio de Gasto",
          `El gasto planificado "${expense.name}" está programado para dentro de ${daysBeforePayment} días.`,
          { type: "expense", id: expense.id },
        )
      }
    }
  })
}

// Comprobar alertas de saldo bajo
function checkLowBalanceAlerts(today) {
  // Obtener el mes actual en formato YYYY-MM
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

  // Obtener ingresos del mes
  const monthlyIncomes = JSON.parse(localStorage.getItem("monthlyIncomes")) || []
  const extraIncomes = JSON.parse(localStorage.getItem("extraIncomes")) || []
  const monthlyIncome = monthlyIncomes.find((income) => income.month === currentMonth)
  const extraIncomesFiltered = extraIncomes.filter((income) => income.month === currentMonth)

  if (!monthlyIncome && extraIncomesFiltered.length === 0) return // No hay ingresos registrados

  // Calcular ingresos totales
  const totalIncome =
    (monthlyIncome ? monthlyIncome.amount : 0) + extraIncomesFiltered.reduce((sum, income) => sum + income.amount, 0)

  // Obtener gastos del mes
  const monthlyExpenses = getMonthlyExpenses(today.getFullYear(), today.getMonth())

  // Calcular saldo disponible
  const availableBalance = totalIncome - monthlyExpenses

  // Calcular porcentaje disponible
  const availablePercentage = (availableBalance / totalIncome) * 100

  // Comprobar si está por debajo del umbral
  if (availablePercentage < notificationSettings.lowBalanceThreshold) {
    showNotification(
      "Alerta de Saldo Bajo",
      `Tu saldo disponible para este mes es de $${formatCurrency(availableBalance)}, lo que representa solo el ${availablePercentage.toFixed(1)}% de tus ingresos.`,
      { type: "balance" },
    )
  }
}

// Comprobar recordatorios de metas
function checkGoalReminders(today) {
  // Obtener metas de ahorro
  const savingsGoals = JSON.parse(localStorage.getItem("savingsGoals")) || []

  savingsGoals.forEach((goal) => {
    const targetDate = new Date(goal.targetDate)
    targetDate.setHours(0, 0, 0, 0)

    const daysUntilTarget = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24))

    // Notificar cuando faltan 30, 15, 7 o 1 día(s)
    if ([30, 15, 7, 1].includes(daysUntilTarget)) {
      const percentComplete = (goal.currentAmount / goal.targetAmount) * 100

      if (percentComplete < 90) {
        // Solo notificar si no está casi completa
        showNotification(
          "Recordatorio de Meta de Ahorro",
          `Faltan ${daysUntilTarget} día(s) para alcanzar tu meta "${goal.name}". Has completado el ${percentComplete.toFixed(1)}%.`,
          { type: "goal", id: goal.id },
        )
      }
    }
  })
}

// Mostrar notificación
function showNotification(title, message, data = {}) {
  console.log("Mostrando notificación:", title, message)

  // Verificar permisos
  if (Notification.permission !== "granted") {
    console.log("No hay permiso para mostrar notificaciones")
    return
  }

  // Crear notificación
  try {
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico", // Puedes cambiar esto por un ícono personalizado
    })

    // Manejar clic en la notificación
    notification.onclick = function () {
      window.focus()
      navigateToNotificationTarget(data)
      this.close()
    }

    // Guardar en historial de notificaciones
    saveNotificationToHistory(title, message, data)

    console.log("Notificación mostrada correctamente")
  } catch (error) {
    console.error("Error al mostrar notificación:", error)
  }
}

// Navegar al destino de la notificación
function navigateToNotificationTarget(data) {
  switch (data.type) {
    case "credit-card":
      window.location.href = "app.html"
      break

    case "expense":
      window.location.href = "planificacion.html"
      setTimeout(() => {
        const tabButton = document.querySelector('.tab-button[data-tab="pending"]')
        if (tabButton) tabButton.click()
      }, 500)
      break

    case "balance":
      window.location.href = "planificacion.html"
      setTimeout(() => {
        const tabButton = document.querySelector('.tab-button[data-tab="balance"]')
        if (tabButton) tabButton.click()
      }, 500)
      break

    case "goal":
      window.location.href = "planificacion.html"
      setTimeout(() => {
        const tabButton = document.querySelector('.tab-button[data-tab="goals"]')
        if (tabButton) tabButton.click()
      }, 500)
      break
  }
}

// Guardar notificación en historial
function saveNotificationToHistory(title, message, data) {
  const notificationHistory = JSON.parse(localStorage.getItem("notificationHistory")) || []

  notificationHistory.push({
    id: Date.now().toString(),
    title,
    message,
    data,
    timestamp: new Date().toISOString(),
    read: false,
  })

  // Limitar a las últimas 50 notificaciones
  if (notificationHistory.length > 50) {
    notificationHistory.shift()
  }

  localStorage.setItem("notificationHistory", JSON.stringify(notificationHistory))

  // Actualizar contador de notificaciones
  updateNotificationCounter()
}

// Actualizar contador de notificaciones
function updateNotificationCounter() {
  const notificationHistory = JSON.parse(localStorage.getItem("notificationHistory")) || []
  const unreadCount = notificationHistory.filter((notification) => !notification.read).length

  const counter = document.getElementById("notification-counter")
  if (counter) {
    if (unreadCount > 0) {
      counter.textContent = unreadCount
      counter.style.display = "block"
    } else {
      counter.style.display = "none"
    }
  }
}

// Obtener gastos mensuales
function getMonthlyExpenses(year, month) {
  let totalExpenses = 0

  // Gastos de tarjeta de crédito
  const creditCardExpenses = JSON.parse(localStorage.getItem("expenses")) || []

  creditCardExpenses.forEach((expense) => {
    expense.installments.forEach((installment) => {
      if (!installment.paid) {
        const dueDate = new Date(installment.dueDate)

        if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
          totalExpenses += Number.parseFloat(installment.amount)
        }
      }
    })
  })

  // Gastos planificados
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  plannedExpenses.forEach((expense) => {
    if (!expense.completed) {
      const expenseDate = new Date(expense.date)

      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        totalExpenses += expense.amount
      }
    }
  })

  return totalExpenses
}

// Formatear moneda
function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.")
}

// Crear una notificación de prueba para verificar que funciona
function createTestNotification() {
  console.log("Creando notificación de prueba...")
  showNotification(
    "Notificación de Prueba",
    "Esta es una notificación de prueba para verificar que el sistema funciona correctamente.",
    { type: "test" },
  )
}

// Añadir función de prueba al objeto window para poder llamarla desde la consola
window.createTestNotification = createTestNotification

// Inicializar cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, inicializando notificaciones...")

  // Inicializar notificaciones
  setTimeout(initNotifications, 1000)

  // Actualizar contador de notificaciones
  updateNotificationCounter()
  
  // Agregar evento al botón de cerrar modal de notificaciones
  const closeNotificationsModal = document.querySelector("#notifications-modal .close-modal");
  if (closeNotificationsModal) {
    closeNotificationsModal.addEventListener("click", function() {
      const notificationsModal = document.getElementById("notifications-modal");
      if (notificationsModal) {
        notificationsModal.style.display = "none";
      }
    });
  }
})