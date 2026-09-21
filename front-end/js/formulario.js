import { cambiarPestanaA } from './tabs.js';
import { cargarVehiculosEnSelect } from './vehiculos.js';

export function habilitarFormularioVehiculo(nombre, rut, clienteId) {
    // Transición de formularios dentro de la misma pestaña (Registro)
    document.getElementById('seccionCliente').style.display = 'none'; 
    document.getElementById('seccionVehiculo').style.display = 'block'; 
    
    document.getElementById('cliente_id_hidden').value = clienteId;
    document.getElementById('cliente_asociado_nombre').textContent = 
        `Vehículo asociado a: ${nombre} (RUT: ${rut})`;
    document.getElementById('cliente_asociado_nombre').style.color = 'green';
    
    document.getElementById('formularioVehiculo').reset();
    document.getElementById('patente_vehiculo').focus();
}


export function restablecerFormularioVehiculo() {
    document.getElementById('seccionVehiculo').style.display = 'none'; 
    document.getElementById('seccionCliente').style.display = 'block'; 
    
    document.getElementById('cliente_id_hidden').value = '';
    document.getElementById('cliente_asociado_nombre').textContent = '¡Registre un cliente primero!';
    document.getElementById('cliente_asociado_nombre').style.color = 'red';
    
    document.getElementById('formularioCliente').reset(); 
}

export function habilitarFormularioServicio() {
    // Volvemos a mostrar el formulario de cliente (para la próxima vez que registren)
    restablecerFormularioVehiculo(); 
    
    // CAMBIAR A LA PESTAÑA DE SERVICIOS
    cambiarPestanaA('tab-servicios');

    // Limpia y carga la lista de autos
    document.getElementById('formularioServicio').reset();
    cargarVehiculosEnSelect(); 
}

export function restablecerFormularioServicio() {
    document.getElementById('formularioServicio').reset(); 
    // Volver a la pestaña de registro
    cambiarPestanaA('tab-registro');
    // Asegurarse de que muestre el formulario de Cliente
    restablecerFormularioVehiculo(); 
}
