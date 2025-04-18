// DOM Elements
const enterAppButton = document.getElementById("enter-app")
const startTourButton = document.getElementById("start-tour")
const skipTourButton = document.getElementById("skip-tour")
const tourModal = document.getElementById("tour-modal")
const tourTitle = document.getElementById("tour-title")
const tourContent = document.getElementById("tour-content")
const tourStep = document.getElementById("tour-step")
const tourProgress = document.getElementById("tour-progress")
const tourNextButton = document.getElementById("tour-next")
const tourPrevButton = document.getElementById("tour-prev")
const tourCloseButton = document.getElementById("tour-close")
const tourHighlight = document.getElementById("tour-highlight")

// Tour state
let currentStep = 0
const tourCompleted = localStorage.getItem("tourCompleted") === "true"
let tourSteps = []

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Check if user has completed the tour
  if (tourCompleted) {
    // If tour is completed, hide the welcome container and show the features directly
    document.querySelector(".welcome-container").style.display = "block"
    document.querySelector(".tour-container").style.display = "none"
  } else {
    // If tour is not completed, show the tour welcome screen
    document.querySelector(".welcome-container").style.display = "none"
    document.querySelector(".tour-container").style.display = "block"
  }

  // Event listeners
  if (enterAppButton) {
    enterAppButton.addEventListener("click", (e) => {
      // Store last visit date
      const currentDate = new Date()
      localStorage.setItem("lastVisit", currentDate.toISOString())
    })
  }

  // Usar los IDs correctos para los botones de inicio del tour
  const welcomeStartTourButton = document.getElementById("welcome-start-tour")
  if (welcomeStartTourButton) {
    welcomeStartTourButton.addEventListener("click", (e) => {
      e.preventDefault() // Prevenir navegación por defecto
      startTour()
    })
  }

  if (startTourButton) {
    startTourButton.addEventListener("click", startTour)
  }

  if (skipTourButton) {
    skipTourButton.addEventListener("click", skipTour)
  }

  if (tourNextButton) {
    tourNextButton.addEventListener("click", nextTourStep)
  }

  if (tourPrevButton) {
    tourPrevButton.addEventListener("click", prevTourStep)
  }

  if (tourCloseButton) {
    tourCloseButton.addEventListener("click", closeTour)
  }

  // Define tour steps
  defineTourSteps()

  // Check if we need to continue the tour from a previous step
  checkTourContinuation()
})

// Define all tour steps
function defineTourSteps() {
  tourSteps = [
    {
      title: "¡Bienvenido a tu Sistema de Finanzas Personales!",
      content: `
        <p>Este sistema te ayudará a planificar y controlar tus finanzas personales de manera efectiva.</p>
        <p>Te guiaremos a través de los pasos básicos para comenzar a utilizar la aplicación.</p>
        <p>Al finalizar, podrás:</p>
        <ul>
          <li>Registrar tus ingresos mensuales</li>
          <li>Planificar gastos futuros</li>
          <li>Controlar tus gastos de tarjeta de crédito</li>
          <li>Ver proyecciones financieras mes a mes</li>
        </ul>
      `,
      target: null,
      position: "center",
      action: null,
    },
    {
      title: "Paso 1: Registra tu Sueldo Mensual",
      content: `
        <p>El primer paso es registrar tu sueldo mensual. Esto es fundamental para calcular tu presupuesto disponible.</p>
        <p>Haz clic en "Siguiente" para ir a la página de planificación y registrar tu sueldo.</p>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>En la página de planificación, selecciona la pestaña "Ingresos"</li>
          <li>Ingresa el mes actual y tu sueldo mensual</li>
          <li>Opcionalmente, agrega notas sobre tu sueldo</li>
          <li>Haz clic en "Guardar Sueldo"</li>
        </ol>
        <p>Después de guardar tu sueldo, podrás continuar con el tour.</p>
      `,
      target: null,
      position: "center",
      action: () => {
        // Marcar que el tour está en progreso
        localStorage.setItem("tourInProgress", "true")
        localStorage.setItem("tourStep", "1")
        // This will be executed when the user clicks "Next" on this step
        window.location.href = "planificacion.html?tour=income"
      },
    },
    {
      title: "Paso 2: Agrega Ingresos Extra",
      content: `
        <p>Además de tu sueldo, puedes registrar ingresos adicionales como trabajos freelance, bonos o regalos.</p>
        <p>Haz clic en "Siguiente" para ir a la página de planificación y agregar un ingreso extra.</p>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>En la pestaña "Ingresos", desplázate hasta la sección "Ingresos Extra"</li>
          <li>Selecciona el mes, describe el ingreso y especifica el monto</li>
          <li>Haz clic en "Agregar Ingreso Extra"</li>
        </ol>
        <p>Estos ingresos se sumarán a tu sueldo para calcular tu presupuesto total disponible.</p>
      `,
      target: null,
      position: "center",
      action: () => {
        // Marcar que el tour está en progreso
        localStorage.setItem("tourInProgress", "true")
        localStorage.setItem("tourStep", "2")
        // Redirigir a la página de planificación con el parámetro para ingresos extra
        window.location.href = "planificacion.html?tour=extra-income"
      },
    },
    {
      title: "Paso 3: Planifica tus Gastos Futuros",
      content: `
        <p>Ahora que has registrado tus ingresos, es momento de planificar tus gastos futuros.</p>
        <p>Haz clic en "Siguiente" para ir a la página de planificación y registrar un gasto planificado.</p>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>Selecciona la pestaña "Registrar Gasto"</li>
          <li>Completa el formulario con los detalles del gasto</li>
          <li>Asigna una categoría y prioridad</li>
          <li>Establece la fecha estimada del gasto</li>
          <li>Haz clic en "Registrar Gasto"</li>
        </ol>
        <p>Estos gastos te ayudarán a planificar tu presupuesto futuro y evitar sorpresas.</p>
      `,
      target: null,
      position: "center",
      action: () => {
        // Marcar que el tour está en progreso
        localStorage.setItem("tourInProgress", "true")
        localStorage.setItem("tourStep", "3")
        // Redirigir a la página de planificación con el parámetro para gastos planificados
        window.location.href = "planificacion.html?tour=planning"
      },
    },
    {
      title: "Paso 4: Visualiza tu Situación Financiera",
      content: `
        <p>Una vez que hayas registrado tus ingresos y gastos, podrás visualizar tu situación financiera mes a mes.</p>
        <p>Haz clic en "Siguiente" para ir a la página de planificación y ver el resumen financiero.</p>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>Selecciona la pestaña "Resumen" en la página de planificación</li>
          <li>Revisa el "Saldo Disponible del Mes Actual"</li>
          <li>Explora el "Saldo Proyectado para Meses Futuros"</li>
          <li>Analiza el desglose de gastos por categoría y mes</li>
        </ol>
        <p>Esta información te ayudará a tomar mejores decisiones financieras y evitar problemas de liquidez.</p>
      `,
      target: null,
      position: "center",
      action: () => {
        // Marcar que el tour está en progreso
        localStorage.setItem("tourInProgress", "true")
        localStorage.setItem("tourStep", "4")
        // Redirigir a la página de planificación con el parámetro para el resumen
        window.location.href = "planificacion.html?tour=summary"
      },
    },
    {
      title: "Paso 5: Registra tus Gastos de Tarjeta de Crédito",
      content: `
        <p>El sistema también te permite llevar un control de tus gastos de tarjeta de crédito y sus cuotas.</p>
        <p>Para registrar gastos de tarjeta de crédito:</p>
        <ol>
          <li>Ve a la sección "Gastos de Tarjeta" haciendo clic en el botón correspondiente</li>
          <li>Selecciona la pestaña "Registrar Gasto"</li>
          <li>Ingresa el nombre del gasto, monto total y número de cuotas</li>
          <li>Establece la fecha de inicio de pago</li>
          <li>Haz clic en "Registrar Gasto"</li>
        </ol>
        <p>El sistema calculará automáticamente tus cuotas mensuales y las incluirá en tu planificación.</p>
      `,
      target: null,
      position: "center",
      action: null,
    },
    {
      title: "¡Felicidades! Ya estás listo para comenzar",
      content: `
        <p>Has completado el tour de introducción a tu Sistema de Finanzas Personales.</p>
        <p>Ahora tienes las herramientas para:</p>
        <ul>
          <li>Registrar y controlar tus ingresos</li>
          <li>Planificar tus gastos futuros</li>
          <li>Administrar tus gastos de tarjeta de crédito</li>
          <li>Visualizar tu situación financiera mes a mes</li>
        </ul>
        <p>Recuerda actualizar regularmente tus ingresos y gastos para mantener una planificación financiera efectiva.</p>
        <p>Haz clic en "Finalizar" para comenzar a utilizar el sistema.</p>
      `,
      target: null,
      position: "center",
      action: () => {
        // Mark tour as completed
        localStorage.setItem("tourCompleted", "true")
        localStorage.removeItem("tourInProgress")
        localStorage.removeItem("tourStep")
        // Redirect to planning page
        window.location.href = "planificacion.html"
      },
    },
  ]
}

// Start the guided tour
function startTour() {
  document.querySelector(".tour-container").style.display = "none"
  document.querySelector(".welcome-container").style.display = "none"
  showTourModal(0)
}

// Skip the tour and go directly to the app
function skipTour() {
  localStorage.setItem("tourCompleted", "true")
  localStorage.removeItem("tourInProgress")
  localStorage.removeItem("tourStep")
  window.location.href = "planificacion.html"
}

// Show the tour modal for a specific step
function showTourModal(stepIndex) {
  if (stepIndex < 0 || stepIndex >= tourSteps.length) return

  currentStep = stepIndex
  const step = tourSteps[currentStep]

  // Update modal content
  tourTitle.textContent = step.title
  tourContent.innerHTML = step.content
  tourStep.textContent = `Paso ${currentStep + 1} de ${tourSteps.length}`

  // Update progress bar
  const progressPercentage = ((currentStep + 1) / tourSteps.length) * 100
  tourProgress.style.width = `${progressPercentage}%`

  // Show/hide prev button based on step
  if (currentStep === 0) {
    tourPrevButton.style.display = "none"
  } else {
    tourPrevButton.style.display = "block"
  }

  // Update next button text on last step
  if (currentStep === tourSteps.length - 1) {
    tourNextButton.textContent = "Finalizar"
  } else {
    tourNextButton.textContent = "Siguiente"
  }

  // Position the highlight if there's a target
  if (step.target) {
    const targetElement = document.querySelector(step.target)
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      tourHighlight.style.display = "block"
      tourHighlight.style.top = `${rect.top - 10}px`
      tourHighlight.style.left = `${rect.left - 10}px`
      tourHighlight.style.width = `${rect.width + 20}px`
      tourHighlight.style.height = `${rect.height + 20}px`
    }
  } else {
    tourHighlight.style.display = "none"
  }

  // Show the modal
  tourModal.style.display = "block"
}

// Move to the next step in the tour
function nextTourStep() {
  // Execute the current step's action if it exists
  const currentStepData = tourSteps[currentStep]
  if (currentStepData.action) {
    currentStepData.action()
    return
  }

  // Otherwise, move to the next step
  if (currentStep < tourSteps.length - 1) {
    showTourModal(currentStep + 1)
  } else {
    // This is the last step
    closeTour()
    localStorage.setItem("tourCompleted", "true")
    localStorage.removeItem("tourInProgress")
    localStorage.removeItem("tourStep")
    window.location.href = "planificacion.html"
  }
}

// Move to the previous step in the tour
function prevTourStep() {
  if (currentStep > 0) {
    showTourModal(currentStep - 1)
  }
}

// Close the tour
function closeTour() {
  tourModal.style.display = "none"
  tourHighlight.style.display = "none"
  document.querySelector(".welcome-container").style.display = "block"
}

// Check URL parameters to see if we need to continue the tour
function checkTourContinuation() {
  const urlParams = new URLSearchParams(window.location.search)
  const continueParam = urlParams.get("continue")

  if (continueParam) {
    // Remove the parameter from the URL without refreshing
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)

    // Continue the tour based on the parameter
    if (continueParam === "extra-income") {
      // Continue to step 2 (Ingresos Extra)
      showTourModal(2)
    } else if (continueParam === "planning") {
      // Continue to step 3 (Planificación de Gastos)
      showTourModal(3)
    } else if (continueParam === "summary") {
      // Continue to step 4 (Visualización Financiera)
      showTourModal(4)
    } else if (continueParam === "finish") {
      // Continue to final step
      showTourModal(5)
    }
  }
}

// convertir a USD
fetch('https://dolarapi.com/v1/dolares/oficial')
                .then(response => response.json())
                .then(dolar => {
                  const dolarCompra = dolar.compra;
                  const dolarVenta = dolar.venta;
                  const compra = document.querySelector('.dolar-compra');
                  const venta = document.querySelector('.dolar-venta');
                  compra.innerHTML = `<strong>Compra:</strong> ARS$ ${dolarCompra.toFixed(2)}`;
                  venta.innerHTML = `<strong>Venta:</strong> ARS$ ${dolarVenta.toFixed(2)}`;
                })

