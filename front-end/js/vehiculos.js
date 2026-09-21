
import { ENDPOINTS, apifetch } from './api.js';
import { validarPatente } from './validar-patente.js';
import { habilitarFormularioServicio } from './vistas.js';

let listaVehiculos = []; 
export async function registrarVehiculo(event) {
  if (event) event.preventDefault();

  const btn = document.getElementById('btnRegistrarVehiculo');
  const clienteId = document.getElementById('cliente_id_hidden')?.value.trim();
  const patente = document.getElementById('patente_vehiculo')?.value.trim();
  const patenteLimpia = patente?.replace(/[\s\-\.]/g, '').toUpperCase();
  const modelo = document.getElementById('modelo_vehiculo')?.value.trim();
  const color = document.getElementById('color_vehiculo')?.value.trim();
  const anio = document.getElementById('anio_vehiculo')?.value.trim();

  if (!clienteId || !patente || !modelo || !color || !anio) {
    alert('❌ Error: El Cliente, Patente, Modelo, Color y Año son obligatorios.');
    return false;
  }

  if (!validarPatente(patente)) {
    alert('❌ Error: La patente no tiene el formato correcto');
    document.getElementById('patente_vehiculo')?.focus();
    return false;
  }

  const anioNum = parseInt(anio, 10);
  const anioActual = new Date().getFullYear();
  if (!anio || anio.length !== 4 || isNaN(anioNum) || anioNum < 1900 || anioNum > anioActual + 1) {
    alert(`❌ Error: El Año debe tener 4 dígitos válidos (entre 1900 y ${anioActual + 1}).`);
    document.getElementById('anio_vehiculo')?.focus();
    return false;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  }

  const datosVehiculo = {
    IdCliente: parseInt(clienteId, 10),
    Patente: patenteLimpia,
    Modelo: modelo,
    Color: color,
    Anio: anioNum,
  };

  try {
    // apifetch ya maneja Content-Type, token x-access-token y JSON.stringify
    const response = await apifetch(ENDPOINTS.Vehiculos, {
      method: 'POST',
      body: datosVehiculo,
    });

    const resultado = await response.json();

    if (response.ok || response.status === 201) {
      alert(`✅ Vehículo con patente ${patenteLimpia} registrado correctamente.`);
      
      if (typeof habilitarFormularioServicio === 'function') {
        habilitarFormularioServicio();
      }
    } else {
      console.error('Error del servidor:', resultado);
      alert(`❌ Error (${response.status}): ${resultado.error || resultado.message || 'Error al procesar la solicitud.'}`);
    }
  } catch (error) {
    console.error('Error de red al registrar vehículo:', error);
    alert('❌ Fallo al conectar con el servidor.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Registrar Vehículo y Asignar Servicio';
    }
  }

  return false;
}

 export async function cargarVehiculosEnSelect() {
    const select = document.getElementById('select_auto');
    select.innerHTML = '<option value="">Cargando vehículos...</option>';
    
    try {
        const response = await apifetch(ENDPOINTS.Vehiculos, {
      method: 'GET'
    });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        listaVehiculos = await response.json();
        
        select.innerHTML = '<option value="">-- Seleccione un Vehículo --</option>';
        listaVehiculos.forEach(auto => {
            const option = document.createElement('option');
            option.value = auto.IdAuto; 
            option.textContent = `${auto.Patente} - ${auto.Modelo}`;
            option.dataset.idCliente = auto.IdCliente; 
            option.dataset.modelo = auto.Modelo;
            option.dataset.patente = auto.Patente; 
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar la lista de vehículos:', error);
        select.innerHTML = '<option value="">Error al cargar vehículos</option>';
    }
}