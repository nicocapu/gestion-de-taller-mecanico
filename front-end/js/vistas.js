
import { apifetch, ENDPOINTS } from './api.js';
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


const btnCancelar = document.getElementById('btn_cancelar_registro'); //

if (btnCancelar) {
  btnCancelar.addEventListener('click', async () => {
    const inputHidden = document.getElementById('cliente_id_hidden'); //
    const clienteId = inputHidden ? inputHidden.value : null;

    if (clienteId) {
      try {
        await apifetch(`${ENDPOINTS.Clientes}/${clienteId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error al borrar cliente huérfano:', err);
      }
    }

    // --- RESTABLECER VISTAS Y BOTONES ---
    // 1. Limpiar formularios
    document.getElementById('formularioVehiculo')?.reset(); //
    document.getElementById('formularioCliente')?.reset();

    // 2. Reactivar el botón de Registrar Cliente
    const btnCliente = document.getElementById('btnRegistrarCliente');
    if (btnCliente) {
      btnCliente.disabled = false;
      btnCliente.textContent = 'Registrar Cliente';
    }

    // 3. Alternar las pantallas
    const seccionVehiculo = document.getElementById('seccionVehiculo'); //
    const seccionCliente = document.getElementById('seccionCliente');

    if (seccionVehiculo) seccionVehiculo.style.display = 'none'; //
    if (seccionCliente) seccionCliente.style.display = 'block';
  });
}

function restablecerVista() {
  // Limpiar campos del vehículo y resetear input hidden
  const formVehiculo = document.getElementById('formularioVehiculo'); //[cite: 12]
  if (formVehiculo) formVehiculo.reset();
  
  const inputHidden = document.getElementById('cliente_id_hidden'); //[cite: 12]
  if (inputHidden) inputHidden.value = '';

  // Alternar vistas (ajusta según el ID de tu contenedor de cliente)
  const seccionVehiculo = document.getElementById('seccionVehiculo'); //[cite: 12]
  const seccionCliente = document.getElementById('seccionCliente');

  if (seccionVehiculo) seccionVehiculo.style.display = 'none';
  if (seccionCliente) seccionCliente.style.display = 'block';
}


export function restablecerFormularioVehiculo() {
  // Limpiar campos del vehículo
  document.getElementById('formularioVehiculo')?.reset();
  
  // Volver a mostrar formulario de cliente y ocultar el de vehículo
  const seccionCliente = document.getElementById('seccionCliente');
  const seccionVehiculo = document.getElementById('seccionVehiculo');
  
  if (seccionCliente) seccionCliente.style.display = 'block';
  if (seccionVehiculo) seccionVehiculo.style.display = 'none';

  const inputHidden = document.getElementById('cliente_id_hidden');
  if (inputHidden) inputHidden.value = '';
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