// DOM Elements
const notificationsEnabledInput = document.getElementById("notifications-enabled")
const notificationSettingsDiv = document.getElementById("notification-settings")
const paymentRemindersInput = document.getElementById("payment-reminders")
const daysBeforePaymentInput = document.getElementById("days-before-payment")
const lowBalanceAlertsInput = document.getElementById("low-balance-alerts")
const lowBalanceThresholdInput = document.getElementById("low-balance-threshold")
const goalRemindersInput = document.getElementById("goal-reminders")
const saveSettingsBtn = document.getElementById("save-settings")

// Notification modal elements
const notificationIcon = document.getElementById("notification-icon")
const notificationsModal = document.getElementById("notifications-modal")
const closeNotificationsModal = document.querySelector("#notifications-modal .close-modal")
const notificationsList = document.getElementById("notifications-list")
const markAllReadBtn = document.getElementById("mark-all-read")
const clearNotificationsBtn = document.getElementById("clear-notifications")

// Export buttons
const exportAllBtn = document.getElementById("export-all")
const exportExpensesBtn = document.getElementById("export-expenses")
const exportIncomesBtn = document.getElementById("export-incomes")

// Theme buttons
const themeLight = document.getElementById("theme-light")
const themeDark = document.getElementById("theme-dark")
const themeSystem = document.getElementById("theme-system")

// Initialize settings
function initSettings() {
  console.log("Inicializando configuración...");
  
  // Verificar que los elementos DOM existan
  if (!themeLight || !themeDark || !themeSystem) {
    console.error("Elementos de tema no encontrados. Verifica los IDs en el HTML.");
  } else {
    console.log("Elementos de tema encontrados correctamente");
  }

  // Load notification settings
  const settings = JSON.parse(localStorage.getItem("notificationSettings")) || {
    enabled: true,
    paymentReminders: true,
    daysBeforePayment: 3,
    lowBalanceAlerts: true,
    lowBalanceThreshold: 20,
    goalReminders: true,
  }

  // Set form values if elements exist
  if (notificationsEnabledInput) notificationsEnabledInput.checked = settings.enabled;
  if (paymentRemindersInput) paymentRemindersInput.checked = settings.paymentReminders;
  if (daysBeforePaymentInput) daysBeforePaymentInput.value = settings.daysBeforePayment;
  if (lowBalanceAlertsInput) lowBalanceAlertsInput.checked = settings.lowBalanceAlerts;
  if (lowBalanceThresholdInput) lowBalanceThresholdInput.value = settings.lowBalanceThreshold;
  if (goalRemindersInput) goalRemindersInput.checked = settings.goalReminders;

  // Toggle notification settings visibility
  if (notificationsEnabledInput && notificationSettingsDiv) {
    toggleNotificationSettings();
  }

  // Load theme settings
  const theme = localStorage.getItem("theme") || "light";
  setTheme(theme);
  console.log("Tema actual:", theme);

  // Event listeners
  if (notificationsEnabledInput) {
    notificationsEnabledInput.addEventListener("change", toggleNotificationSettings);
  }
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", saveSettings);
  }

  // Export buttons
  if (exportAllBtn) exportAllBtn.addEventListener("click", exportAllData);
  if (exportExpensesBtn) exportExpensesBtn.addEventListener("click", exportExpenses);
  if (exportIncomesBtn) exportIncomesBtn.addEventListener("click", exportIncomes);

  // Theme buttons - Asegurarse de que los event listeners se añadan correctamente
  if (themeLight) {
    themeLight.addEventListener("click", function() {
      console.log("Cambiando a tema claro");
      setTheme("light");
    });
  }
  
  if (themeDark) {
    themeDark.addEventListener("click", function() {
      console.log("Cambiando a tema oscuro");
      setTheme("dark");
    });
  }
  
  if (themeSystem) {
    themeSystem.addEventListener("click", function() {
      console.log("Cambiando a tema del sistema");
      setTheme("system");
    });
  }

  // Notification modal
  if (notificationIcon) {
    notificationIcon.addEventListener("click", openNotificationsModal);
  }
  
  if (closeNotificationsModal) {
    closeNotificationsModal.addEventListener("click", closeModal);
  }
  
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllNotificationsAsRead);
  }
  
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener("click", clearAllNotifications);
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === notificationsModal) {
      closeModal();
    }
  });

  // Load notifications
  loadNotifications();
  console.log("Configuración inicializada correctamente");
}

// Toggle notification settings visibility
function toggleNotificationSettings() {
  if (notificationsEnabledInput && notificationSettingsDiv) {
    if (notificationsEnabledInput.checked) {
      notificationSettingsDiv.style.display = "block";
    } else {
      notificationSettingsDiv.style.display = "none";
    }
  }
}

// Save settings
function saveSettings() {
  // Save notification settings
  const settings = {
    enabled: notificationsEnabledInput ? notificationsEnabledInput.checked : true,
    paymentReminders: paymentRemindersInput ? paymentRemindersInput.checked : true,
    daysBeforePayment: daysBeforePaymentInput ? Number.parseInt(daysBeforePaymentInput.value) : 3,
    lowBalanceAlerts: lowBalanceAlertsInput ? lowBalanceAlertsInput.checked : true,
    lowBalanceThreshold: lowBalanceThresholdInput ? Number.parseInt(lowBalanceThresholdInput.value) : 20,
    goalReminders: goalRemindersInput ? goalRemindersInput.checked : true,
  }

  localStorage.setItem("notificationSettings", JSON.stringify(settings))

  // Show success message
  showSuccessModal("Configuración Guardada", "La configuración ha sido guardada correctamente.")
}

// Set theme - Mejorar esta función
function setTheme(theme) {
  console.log("Estableciendo tema:", theme);
  
  // Verificar que los elementos DOM existan
  if (!themeLight || !themeDark || !themeSystem) {
    console.error("Elementos de tema no encontrados en setTheme");
    return;
  }

  // Remove active class from all theme buttons
  themeLight.classList.remove("active");
  themeDark.classList.remove("active");
  themeSystem.classList.remove("active");

  // Add active class to selected theme button
  switch (theme) {
    case "light":
      themeLight.classList.add("active");
      document.body.classList.remove("dark-theme");
      break;
    case "dark":
      themeDark.classList.add("active");
      document.body.classList.add("dark-theme");
      break;
    case "system":
      themeSystem.classList.add("active");
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
      break;
  }

  // Save theme preference
  localStorage.setItem("theme", theme);
  console.log("Tema guardado:", theme);
}

// Export all data
function exportAllData() {
  const data = {
    expenses: JSON.parse(localStorage.getItem("expenses")) || [],
    plannedExpenses: JSON.parse(localStorage.getItem("plannedExpenses")) || [],
    monthlyIncomes: JSON.parse(localStorage.getItem("monthlyIncomes")) || [],
    extraIncomes: JSON.parse(localStorage.getItem("extraIncomes")) || [],
    savingsGoals: JSON.parse(localStorage.getItem("savingsGoals")) || [],
  }

  downloadJSON(data, "finanzas_personales_completo.json")
}

// Export expenses - CORREGIDO
function exportExpenses() {
  const data = {
    creditCardExpenses: JSON.parse(localStorage.getItem("expenses")) || [],
    plannedExpenses: JSON.parse(localStorage.getItem("plannedExpenses")) || []
  }

  downloadJSON(data, "gastos.json")
}

// Export incomes
function exportIncomes() {
  const data = {
    monthlyIncomes: JSON.parse(localStorage.getItem("monthlyIncomes")) || [],
    extraIncomes: JSON.parse(localStorage.getItem("extraIncomes")) || [],
  }

  downloadJSON(data, "ingresos.json")
}

// Download JSON file
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// Open notifications modal
function openNotificationsModal() {
  notificationsModal.style.display = "block"
  loadNotifications()
}

// Close modal
function closeModal() {
  notificationsModal.style.display = "none"
}

// Load notifications
function loadNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notificationHistory")) || []

  if (notifications.length === 0) {
    notificationsList.innerHTML = '<p class="no-notifications">No tienes notificaciones.</p>'
    return
  }

  // Sort by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  let html = ""

  notifications.forEach((notification) => {
    const date = new Date(notification.timestamp)
    const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

    html += `
      <div class="notification-item ${notification.read ? "read" : "unread"}" data-id="${notification.id}">
        <div class="notification-header">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-date">${formattedDate}</div>
        </div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-actions">
          <button class="btn-secondary btn-sm" onclick="viewNotificationDetails('${notification.id}')">Ver Detalles</button>
          <button class="btn-danger btn-sm" onclick="deleteNotification('${notification.id}')">Eliminar</button>
        </div>
      </div>
    `
  })

  notificationsList.innerHTML = html
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  const notifications = JSON.parse(localStorage.getItem("notificationHistory")) || []

  if (notifications.length === 0) return

  notifications.forEach((notification) => {
    notification.read = true
  })

  localStorage.setItem("notificationHistory", JSON.stringify(notifications))
  loadNotifications()
  updateNotificationCounter()
}

// Clear all notifications
function clearAllNotifications() {
  if (confirm("¿Estás seguro de que deseas eliminar todas las notificaciones?")) {
    localStorage.setItem("notificationHistory", JSON.stringify([]))
    loadNotifications()
    updateNotificationCounter()
  }
}

// View notification details
function viewNotificationDetails(id) {
  const notifications = JSON.parse(localStorage.getItem("notificationHistory")) || []
  const notification = notifications.find((n) => n.id === id)

  if (!notification) return

  // Mark as read
  notification.read = true
  localStorage.setItem("notificationHistory", JSON.stringify(notifications))

  // Navigate to the appropriate section based on notification type
  navigateToNotificationTarget(notification.data)

  // Close modal
  closeModal()

  // Update counter
  updateNotificationCounter()
}

// Delete notification
function deleteNotification(id) {
  const notifications = JSON.parse(localStorage.getItem("notificationHistory")) || []
  const updatedNotifications = notifications.filter((n) => n.id !== id)

  localStorage.setItem("notificationHistory", JSON.stringify(updatedNotifications))
  loadNotifications()
  updateNotificationCounter()
}

// Show success modal
function showSuccessModal(title, message) {
  const successModal = document.getElementById("success-modal");
  const successTitle = document.getElementById("success-title");
  const successMessage = document.getElementById("success-message");
  const successOk = document.getElementById("success-ok");
  
  if (successModal && successTitle && successMessage) {
    successTitle.textContent = title;
    successMessage.textContent = message;
    successModal.style.display = "block";
    
    // Cerrar modal al hacer clic en Aceptar
    if (successOk) {
      successOk.onclick = function() {
        successModal.style.display = "none";
      };
    }
    
    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
      if (event.target == successModal) {
        successModal.style.display = "none";
      }
    };
  }
}

// Update notification counter
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

// Inicializar cuando DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, configurando listeners para configuración")
  
  // Inicializar inmediatamente si estamos en la pestaña de configuración
  const settingsTab = document.querySelector('.tab-button[data-tab="settings"]');
  if (settingsTab && settingsTab.classList.contains("active")) {
    console.log("Pestaña de configuración activa al cargar");
    setTimeout(initSettings, 100);
  }
  
  // Inicializar cuando se hace clic en la pestaña de configuración
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.dataset.tab === "settings") {
        console.log("Pestaña de configuración seleccionada");
        setTimeout(initSettings, 100);
      }
    });
  });
  
  // También inicializar cuando se hace clic en un elemento del menú compacto
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function() {
      if (this.dataset.tab === "settings") {
        console.log("Elemento de menú configuración seleccionado");
        setTimeout(initSettings, 100);
      }
    });
  });

  // Initialize notification counter
  updateNotificationCounter();

  // Add notification icon click handler
  if (notificationIcon) {
    notificationIcon.addEventListener("click", openNotificationsModal);
  }
});

// Hacer que las funciones estén disponibles globalmente
window.setTheme = setTheme;
window.viewNotificationDetails = viewNotificationDetails;
window.deleteNotification = deleteNotification;
window.openNotificationsModal = openNotificationsModal;
window.closeModal = closeModal;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.clearAllNotifications = clearAllNotifications;