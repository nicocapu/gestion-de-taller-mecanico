import { cambiarPestanaA } from './tabs.js';
import { cargarVehiculosEnSelect } from './vehiculos.js';

export function habilitarFormularioVehiculo(nombre, rut, clienteId) {
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
    restablecerFormularioVehiculo(); 
    
    cambiarPestanaA('tab-servicios');

   
    document.getElementById('formularioServicio').reset();
    cargarVehiculosEnSelect(); 
}

export function restablecerFormularioServicio() {
  // 1. Limpiar campos del formulario de servicio
  const formServicio = document.getElementById('formularioServicio');
  if (formServicio) formServicio.reset();

  // 2. Limpiar inputs ocultos e indicadores
  const hiddenCliente = document.getElementById('servicio_id_cliente_hidden');
  const hiddenAuto = document.getElementById('servicio_id_auto_hidden');
  if (hiddenCliente) hiddenCliente.value = '';
  if (hiddenAuto) hiddenAuto.value = '';

  const textoCliente = document.getElementById('cliente_asociado_servicio');
  if (textoCliente) {
    textoCliente.textContent = 'Cliente asociado: N/A';
  }

  // 3. Cambiar a la pestaña de registro usando tu función
  cambiarPestanaA('tab-registro');

  // 4. Asegurar visibilidad del formulario de cliente y ocultar el de vehículo
  const seccionCliente = document.getElementById('seccionCliente');
  const seccionVehiculo = document.getElementById('seccionVehiculo');

  if (seccionCliente) {
    seccionCliente.classList.remove('hidden');
    seccionCliente.style.display = 'block';
  }
  if (seccionVehiculo) {
    seccionVehiculo.classList.add('hidden');
    seccionVehiculo.style.display = 'none';
  }
}

