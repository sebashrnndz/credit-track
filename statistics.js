// Función para inicializar los gráficos
function initializeCharts() {
  console.log("Inicializando gráficos...")
  
  // Asegurarse de que Chart esté disponible
  if (typeof Chart === 'undefined') {
    console.error("Chart.js no está disponible. Verifica que se haya cargado correctamente.");
    return;
  }
  
  // Destruir gráficos existentes antes de crear nuevos
  destroyCharts();
  
  // Esperar un momento para asegurar que los elementos DOM estén listos
  setTimeout(() => {
    renderCategoryChart();
    renderMonthlyChart();
    renderIncomeExpenseChart();
  }, 200);
}

// Función para destruir gráficos existentes
function destroyCharts() {
  // Destruir gráficos existentes si existen
  if (window.chartInstances) {
    Object.values(window.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
  }
  
  // Reiniciar el objeto de instancias
  window.chartInstances = {};
}

// Gráfico de distribución por categoría
function renderCategoryChart() {
  console.log("Renderizando gráfico de categorías...")
  const ctx = document.getElementById("category-chart")
  if (!ctx) {
    console.error("No se encontró el elemento canvas 'category-chart'")
    return
  }

  // Obtener datos de gastos por categoría
  const categoryData = getCategoryData()

  // Colores personalizados que combinan con la aplicación
  const customColors = [
    "#3498db", // Azul principal
    "#e74c3c", // Rojo
    "#2ecc71", // Verde
    "#f39c12", // Naranja
    "#9b59b6", // Púrpura
    "#1abc9c", // Turquesa
    "#34495e", // Azul oscuro
  ]

  // Crear el gráfico
  try {
    const chart = new Chart(ctx, {
      type: "doughnut", // Cambiado de pie a doughnut para mejor apariencia
      data: {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.values,
            backgroundColor: customColors,
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Permite que el gráfico se ajuste al contenedor
        plugins: {
          legend: {
            position: window.innerWidth < 768 ? "bottom" : "right", // Posición adaptativa
            labels: {
              padding: 15,
              usePointStyle: true, // Usa puntos en lugar de rectángulos
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
              },
            },
          },
          title: {
            display: true,
            text: "Distribución de Gastos por Categoría",
            font: {
              size: window.innerWidth < 768 ? 14 : 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.formattedValue
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((context.raw / total) * 100)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%", // Tamaño del agujero en el doughnut
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    })
    
    // Guardar la instancia del gráfico para poder destruirla después
    window.chartInstances.category = chart;
    
    console.log("Gráfico de categorías creado con éxito")
  } catch (error) {
    console.error("Error al crear el gráfico de categorías:", error)
  }
}

// Gráfico de evolución mensual
function renderMonthlyChart() {
  console.log("Renderizando gráfico mensual...")
  const ctx = document.getElementById("monthly-chart")
  if (!ctx) {
    console.error("No se encontró el elemento canvas 'monthly-chart'")
    return
  }

  // Obtener datos de gastos mensuales
  const monthlyData = getMonthlyData()

  // Crear el gráfico
  try {
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: "Gastos Mensuales",
            data: monthlyData.values,
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.2)",
            tension: 0.3, // Aumentado para curvas más suaves
            fill: true,
            pointBackgroundColor: "#3498db",
            pointBorderColor: "#ffffff",
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(200, 200, 200, 0.2)",
            },
            ticks: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
              },
              callback: (value) => "$" + value.toLocaleString(),
            },
            title: {
              display: true,
              text: "Monto ($)",
              font: {
                size: window.innerWidth < 768 ? 12 : 14,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: window.innerWidth < 768 ? 9 : 11,
              },
            },
            title: {
              display: true,
              text: "Mes",
              font: {
                size: window.innerWidth < 768 ? 12 : 14,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
              },
            },
          },
          title: {
            display: true,
            text: "Evolución de Gastos Mensuales",
            font: {
              size: window.innerWidth < 768 ? 14 : 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `Gastos: $${Number.parseFloat(context.raw).toLocaleString()}`,
            },
          },
        },
      },
    })
    
    // Guardar la instancia del gráfico para poder destruirla después
    window.chartInstances.monthly = chart;
    
    console.log("Gráfico mensual creado con éxito")
  } catch (error) {
    console.error("Error al crear el gráfico mensual:", error)
  }
}

// Gráfico comparativo de ingresos vs gastos
function renderIncomeExpenseChart() {
  console.log("Renderizando gráfico de ingresos vs gastos...")
  const ctx = document.getElementById("income-expense-chart")
  if (!ctx) {
    console.error("No se encontró el elemento canvas 'income-expense-chart'")
    return
  }

  // Obtener datos de ingresos y gastos
  const comparisonData = getIncomeExpenseData()

  // Crear el gráfico
  try {
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: comparisonData.labels,
        datasets: [
          {
            label: "Ingresos",
            data: comparisonData.incomeValues,
            backgroundColor: "rgba(46, 204, 113, 0.7)",
            borderColor: "rgb(46, 204, 113)",
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: "rgba(46, 204, 113, 0.9)",
          },
          {
            label: "Gastos",
            data: comparisonData.expenseValues,
            backgroundColor: "rgba(231, 76, 60, 0.7)",
            borderColor: "rgb(231, 76, 60)",
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: "rgba(231, 76, 60, 0.9)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(200, 200, 200, 0.2)",
            },
            ticks: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
              },
              callback: (value) => "$" + value.toLocaleString(),
            },
            title: {
              display: true,
              text: "Monto ($)",
              font: {
                size: window.innerWidth < 768 ? 12 : 14,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: window.innerWidth < 768 ? 9 : 11,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
              },
              usePointStyle: true,
            },
          },
          title: {
            display: true,
            text: "Comparativa de Ingresos vs Gastos",
            font: {
              size: window.innerWidth < 768 ? 14 : 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || ""
                return `${label}: $${Number.parseFloat(context.raw).toLocaleString()}`
              },
            },
          },
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    })
    
    // Guardar la instancia del gráfico para poder destruirla después
    window.chartInstances.incomeExpense = chart;
    
    console.log("Gráfico de ingresos vs gastos creado con éxito")
  } catch (error) {
    console.error("Error al crear el gráfico de ingresos vs gastos:", error)
  }
}

// Función para obtener datos de gastos por categoría
function getCategoryData() {
  console.log("Obteniendo datos de categorías...")
  // Obtener gastos planificados
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  // Crear datos de ejemplo si no hay datos reales
  if (plannedExpenses.length === 0) {
    console.log("No hay datos reales, usando datos de ejemplo")
    return {
      labels: ["Hogar", "Transporte", "Alimentación", "Salud", "Educación", "Entretenimiento", "Otros"],
      values: [3500, 1200, 2800, 950, 1500, 800, 600],
    }
  }

  // Agrupar por categoría
  const categoryTotals = {}

  plannedExpenses.forEach((expense) => {
    if (!expense.completed) {
      const category = getCategoryText(expense.category)
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += Number.parseFloat(expense.amount)
    }
  })

  // Convertir a arrays para Chart.js
  const labels = Object.keys(categoryTotals)
  const values = Object.values(categoryTotals)

  console.log("Datos de categorías obtenidos:", { labels, values })
  return { labels, values }
}

// Función para obtener datos de gastos mensuales
function getMonthlyData() {
  console.log("Obteniendo datos mensuales...")
  // Obtener gastos planificados
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  // Crear datos de ejemplo si no hay datos reales
  if (plannedExpenses.length === 0) {
    console.log("No hay datos reales, usando datos de ejemplo")
    const currentDate = new Date()
    const months = []
    const values = []

    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push(month.toLocaleString("default", { month: "short" }) + " " + month.getFullYear())
      values.push(Math.floor(Math.random() * 5000) + 3000) // Valores aleatorios entre 3000 y 8000
    }

    return { labels: months, values: values }
  }

  // Agrupar por mes
  const monthlyTotals = {}

  plannedExpenses.forEach((expense) => {
    const date = new Date(expense.date)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (!monthlyTotals[monthYear]) {
      monthlyTotals[monthYear] = 0
    }
    monthlyTotals[monthYear] += Number.parseFloat(expense.amount)
  })

  // Ordenar por fecha
  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA - dateB
  })

  const labels = sortedMonths
  const values = sortedMonths.map((month) => monthlyTotals[month])

  console.log("Datos mensuales obtenidos:", { labels, values })
  return { labels, values }
}

// Función para obtener datos comparativos de ingresos vs gastos
function getIncomeExpenseData() {
  console.log("Obteniendo datos de ingresos vs gastos...")
  // Obtener ingresos
  const monthlyIncomes = JSON.parse(localStorage.getItem("monthlyIncomes")) || []
  const extraIncomes = JSON.parse(localStorage.getItem("extraIncomes")) || []

  // Obtener gastos planificados
  const plannedExpenses = JSON.parse(localStorage.getItem("plannedExpenses")) || []

  // Crear datos de ejemplo si no hay datos reales
  if (monthlyIncomes.length === 0 && extraIncomes.length === 0 && plannedExpenses.length === 0) {
    console.log("No hay datos reales, usando datos de ejemplo")
    const currentDate = new Date()
    const months = []
    const incomeValues = []
    const expenseValues = []

    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push(month.toLocaleString("default", { month: "short" }) + " " + month.getFullYear())
      incomeValues.push(Math.floor(Math.random() * 3000) + 8000) // Ingresos entre 8000 y 11000
      expenseValues.push(Math.floor(Math.random() * 4000) + 5000) // Gastos entre 5000 y 9000
    }

    return {
      labels: months,
      incomeValues: incomeValues,
      expenseValues: expenseValues,
    }
  }

  // Agrupar por mes
  const monthlyData = {}

  // Procesar ingresos mensuales
  monthlyIncomes.forEach((income) => {
    const [year, month] = income.month.split("-")
    const date = new Date(year, month - 1, 1)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    monthlyData[monthYear].income += Number.parseFloat(income.amount)
  })

  // Procesar ingresos extra
  extraIncomes.forEach((income) => {
    const [year, month] = income.month.split("-")
    const date = new Date(year, month - 1, 1)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    monthlyData[monthYear].income += Number.parseFloat(income.amount)
  })

  // Procesar gastos
  plannedExpenses.forEach((expense) => {
    const date = new Date(expense.date)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    monthlyData[monthYear].expense += Number.parseFloat(expense.amount)
  })

  // Ordenar por fecha
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA - dateB
  })

  const labels = sortedMonths
  const incomeValues = sortedMonths.map((month) => monthlyData[month].income)
  const expenseValues = sortedMonths.map((month) => monthlyData[month].expense)

  console.log("Datos de ingresos vs gastos obtenidos:", { labels, incomeValues, expenseValues })
  return { labels, incomeValues, expenseValues }
}

// Función auxiliar para obtener el texto de la categoría
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

// Función para ajustar los gráficos cuando cambia el tamaño de la ventana
function resizeCharts() {
  console.log("Redimensionando gráficos...")
  // Reinicializar los gráficos para que se adapten al nuevo tamaño
  setTimeout(initializeCharts, 100)
}

// Inicializar gráficos cuando se carga la pestaña de estadísticas
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, configurando listeners para estadísticas")
  const tabButtons = document.querySelectorAll(".tab-button")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.dataset.tab === "statistics") {
        console.log("Pestaña de estadísticas seleccionada")
        // Inicializar gráficos cuando se selecciona la pestaña
        setTimeout(initializeCharts, 100)
      }
    })
  })

  // Si la pestaña de estadísticas está activa al cargar la página, inicializar gráficos
  const statisticsTab = document.querySelector('.tab-button[data-tab="statistics"]')
  if (statisticsTab && statisticsTab.classList.contains("active")) {
    console.log("Pestaña de estadísticas activa al cargar")
    setTimeout(initializeCharts, 100)
  }
  
  // También inicializar cuando se hace clic en un elemento del menú compacto
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function() {
      if (this.dataset.tab === "statistics") {
        console.log("Elemento de menú estadísticas seleccionado");
        setTimeout(initializeCharts, 100);
      }
    });
  });

  // Añadir evento de redimensionamiento para ajustar los gráficos
  window.addEventListener("resize", resizeCharts)
})