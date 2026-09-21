
import { cambiarPestanaA } from './tabs.js';
import { cargarVehiculosEnSelect } from './vehiculos.js';

export function habilitarFormularioVehiculo(nombre, rut, clienteId) {
    document.getElementById('seccionCliente').classList.add('hidden');
    document.getElementById('seccionVehiculo').classList.remove('hidden');

    document.getElementById('cliente_id_hidden').value = clienteId;

    const textoCliente = document.getElementById('cliente_asociado_nombre');
    textoCliente.textContent = `Vehículo asociado a: ${nombre} (RUT: ${rut})`;
    textoCliente.classList.remove('status-alert');
    textoCliente.classList.add('status-ok');

    document.getElementById('formularioVehiculo').reset();
    document.getElementById('patente_vehiculo').focus();
}

export function restablecerFormularioVehiculo() {
    document.getElementById('seccionVehiculo').classList.add('hidden');
    document.getElementById('seccionCliente').classList.remove('hidden');

    document.getElementById('cliente_id_hidden').value = '';

    const textoCliente = document.getElementById('cliente_asociado_nombre');
    textoCliente.textContent = '¡Registre un cliente primero!';
    textoCliente.classList.remove('status-ok');
    textoCliente.classList.add('status-alert');

    document.getElementById('formularioCliente').reset();
}

export function habilitarFormularioServicio() {
    restablecerFormularioVehiculo();
    cambiarPestanaA('tab-servicios');
    document.getElementById('formularioServicio').reset();
    cargarVehiculosEnSelect();
}

export function restablecerFormularioServicio() {
    document.getElementById('formularioServicio').reset();
    cambiarPestanaA('tab-registro');
    restablecerFormularioVehiculo();
}