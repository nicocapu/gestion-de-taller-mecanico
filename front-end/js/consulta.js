document.addEventListener('DOMContentLoaded', () => {
    // URL base de tu API
    const API_BASE = 'http://localhost:3000';
    
    const form = document.getElementById('estado-vehiculo-form');
    const resultadosDiv = document.getElementById('resultados-vehiculo');
    const mensajeError = document.getElementById('mensaje-error');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        mensajeError.textContent = ''; 
        resultadosDiv.classList.add('hidden'); 

        const rut = document.getElementById('rut').value.trim().toUpperCase();
        const patente = document.getElementById('patente').value.trim().toUpperCase();
        
        if (rut === '' || patente === '') {
            mensajeError.textContent = 'Por favor, ingrese su RUT y la Patente.';
            return;
        }

        // ⭐ INICIO: LLAMADA REAL AL BACKEND ⭐
        // Utilizamos la ruta GET /estado-vehiculo con query parameters
        const apiUrl = `${API_BASE}/estado-vehiculo?rut=${rut}&patente=${patente}`;

        fetch(apiUrl)
        .then(response => {
            if (response.status === 404) {
                // Maneja el error 404 (No encontrado o sin servicio activo)
                throw new Error('No se encontró un vehículo con servicios activos.');
            }
            if (!response.ok) {
                // Maneja otros errores del servidor (500, etc.)
                throw new Error('Error al consultar el estado: ' + response.statusText); 
            }
            return response.json();
        })
        .then(data => {
            // La función mostrarResultados debe usar las claves que devuelve el backend
            if (data) { 
                mostrarResultados(data);
            } else {
                mensajeError.textContent = 'Respuesta vacía o incompleta.';
            }
        })
        .catch(error => {
            console.error('Error al consultar el estado:', error);
            // Muestra el mensaje de error de la excepción
            mensajeError.textContent = error.message || 'Error de conexión. Inténtelo más tarde.';
        });
        // ⭐ FIN: LLAMADA REAL AL BACKEND ⭐
    });

    // Asegúrate de que esta función usa los NOMBRES DE COLUMNA del backend:
    // VehiculoModelo, VehiculoPatente, Diagnostico, Estado, MecanicosACargo, FechaInicio, FechaTerminoEstimada
    function mostrarResultados(data) {
        // Actualizar los campos con los datos
        document.getElementById('vehiculo-nombre').textContent = data.VehiculoModelo || 'N/A';
        document.getElementById('vehiculo-patente').textContent = data.VehiculoPatente;
        document.getElementById('diagnostico').textContent = data.Diagnostico || 'Pendiente de diagnóstico.';
        document.getElementById('estado').textContent = data.Estado;
        
        // El campo del mecánico viene concatenado por la subconsulta SQL
        document.getElementById('mecanico').textContent = data.MecanicosACargo || 'Pendiente de asignación'; 
        
        document.getElementById('fecha-ingreso').textContent = data.FechaInicio;
        document.getElementById('fecha-entrega').textContent = data.FechaTerminoEstimada || 'Aún no definida';

        // Para la lista de servicios, usamos el campo DescripciónProblema (si no tienes una tabla de 'Tareas')
        const ulServicios = document.getElementById('servicios-realizados');
        ulServicios.innerHTML = '';
        const liProblema = document.createElement('li');
        liProblema.textContent = `Problema reportado: ${data.DescripcionProblema}`;
        ulServicios.appendChild(liProblema);
        
        // Mostrar la sección de resultados
        resultadosDiv.classList.remove('hidden');
    }
});