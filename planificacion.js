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
      </div>
  </div>
</div>

<!-- Reemplazar la sección del menú compacto por este código actualizado -->
<div id="compact-menu" class="compact-menu">
  <div class="compact-menu-content">
    <div class="menu-group">
      <div class="menu-group-header" data-group="summary">
        <span class="menu-icon">📊</span>
        <span>Resumen</span>
        <span class="nav-arrow">▶</span>
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

<!-- Contenedor de pestañas (mantener esto) -->
<div class="tabs-container">
        
        <!-- El contenido de las pestañas permanece igual -->
        <div class="tab-content active" id="summary-tab">
            <div class="planning-summary-container card">
                <h2>Resumen de Gastos Planificados</h2>
                <div id="planning-summary"></div>
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

