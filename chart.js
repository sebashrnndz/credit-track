// Este archivo reemplaza la funcionalidad de components/ui/chart.js
// Simplemente expone la variable global Chart para que statistics.js pueda usarla
window.chartInstances = {};

// Asegurarse de que Chart esté disponible globalmente
if (typeof Chart !== 'undefined') {
  console.log("Chart.js está disponible");
} else {
  console.error("Chart.js no está disponible. Verifica que se haya cargado correctamente.");
}

// NO usar export - simplemente hacer Chart disponible globalmente
window.ChartUtil = Chart;