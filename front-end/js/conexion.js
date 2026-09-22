
import { setupTabs } from './tabs.js'
import { registrarVehiculo } from './vehiculos.js';
import {editarDetalleRapido, actualizarEstadoRapido, eliminarServicioPorId, registrarServicio
    ,actualizarClienteServicio, obtenerServiciosPendientes,
    actualizarServicio}
 from './servicios.js';
import {registrarCliente} from './cliente.js';
import {cargarOpcionesMecanicos, alternarRolMecanico} from './registrar-mecanico.js'
import { restablecerFormularioServicio } from './formulario.js';
import  './notificaciones.js'






window.registrarServicio = registrarServicio;
window.editarDetalleRapido = editarDetalleRapido; 
window.actualizarEstadoRapido = actualizarEstadoRapido; // (ya existe)
window.eliminarServicioPorId = eliminarServicioPorId; // (debería añadirse también)
window.actualizarClienteServicio = actualizarClienteServicio;
window.actualizarServicio= actualizarServicio;
window.alternarRolMecanico= alternarRolMecanico;
window.registrarVehiculo = registrarVehiculo;
window.restablecerFormularioServicio= restablecerFormularioServicio;
// =================================================================
// INICIALIZACIÓN
// =================================================================

// Usamos addEventListener para que no choque con otros scripts
function inicializarEventos() {
    console.log("🚀 Aplicación iniciando eventos DOM.");
    
    // 1. Conectar el formulario Cliente
    const formularioCliente = document.getElementById('formularioCliente');
    if (formularioCliente) {
        // Conectamos el evento submit a la función registrarCliente.
        // Esto reemplaza el onsubmit del HTML.
        formularioCliente.addEventListener('submit', registrarCliente); 
    }
    
    // 2. Conectar el formulario Vehículo (ejemplo)
    const formularioVehiculo = document.getElementById('formularioVehiculo');
    if (formularioVehiculo) {
        formularioVehiculo.addEventListener('submit', registrarVehiculo);
    }  
    setupTabs();
    obtenerServiciosPendientes();
    
    // Verificamos si la función del otro archivo existe antes de llamarla
    if (typeof cargarOpcionesMecanicos === 'function') {
        cargarOpcionesMecanicos();
    } else {
        console.warn("⚠️ registrar-mecanico.js no se ha cargado o falta la función cargarOpcionesMecanicos");
    }
    const btnCancelar = document.getElementById('btnCancelarServicio');
if (btnCancelar) {
  btnCancelar.addEventListener('click', restablecerFormularioServicio);
}
}
window.addEventListener('DOMContentLoaded', inicializarEventos);