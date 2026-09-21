const API_CLIENTES_URL = 'http://localhost:3000/Cliente'; 
const API_VEHICULOS_URL = 'http://localhost:3000/Auto'; 
const API_SERVICIOS_URL = 'http://localhost:3000/Servicio'; 
//const API_SERVICIOS_PENDIENTES_URL = 'http://localhost:3000/ServicioMecanico/Mecanico/:idMecanico'; 
const API_SERVICIOS_PATENTE_URL = 'http://localhost:3000/Servicio/patente';


const token = localStorage.getItem('token');
import { validarRut } from './validar-rut.js';
import { validarPatente } from './validar-patente.js';
import { setupTabs } from './tabs.js'
import { registrarVehiculo } from './vehiculos.js';
import {editarDetalleRapido, actualizarEstadoRapido, eliminarServicioPorId, registrarServicio
    ,actualizarClienteServicio, obtenerServiciosPendientes}
 from './servicios.js';
import {habilitarFormularioVehiculo, restablecerFormularioVehiculo, habilitarFormularioServicio, restablecerFormularioServicio} from './formulario.js';
import {cambiarPestanaA} from './tabs.js';
import {registrarCliente} from './cliente.js';
import {} from './vistas.js';






window.registrarServicio = registrarServicio;
window.editarDetalleRapido = editarDetalleRapido; 
window.actualizarEstadoRapido = actualizarEstadoRapido; // (ya existe)
window.eliminarServicioPorId = eliminarServicioPorId; // (debería añadirse también)
// 4. Funciones de Asignación de Servicio
window.actualizarClienteServicio = actualizarClienteServicio;
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
}
window.addEventListener('DOMContentLoaded', inicializarEventos);