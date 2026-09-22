import { ENDPOINTS, apifetch } from './api.js';
import { validarPatente } from './validar-patente.js';
import { habilitarFormularioServicio } from './vistas.js';

let listaAutosCache = [];

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
    const response = await apifetch(ENDPOINTS.Vehiculos, {
      method: 'POST',
      body: datosVehiculo,
    });

    const resultado = await response.json();

    if (response.ok || response.status === 201) {
      alert(`✅ Vehículo con patente ${patenteLimpia} registrado correctamente.`);
      
      // Recargar la lista del datalist para que aparezca de inmediato el auto recién creado
      await cargarVehiculosEnSelect();

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

// Carga datos desde la API y puebla tanto el <datalist> como cualquier select existente
export async function cargarVehiculosEnSelect() {
  const datalist = document.getElementById('lista_vehiculos');
  const select = document.getElementById('select_auto');
  const inputAuto = document.getElementById('input_auto');

  if (inputAuto) inputAuto.placeholder = 'Cargando vehículos...';
  if (select) select.innerHTML = '<option value="">Cargando vehículos...</option>';

  try {
    const [respAutos, respServicios] = await Promise.all([
      apifetch(ENDPOINTS.Vehiculos),
      apifetch(ENDPOINTS.Servicios)
    ]);

    if (!respAutos.ok) throw new Error('Error al obtener lista de vehículos');
    if (!respServicios.ok) throw new Error('Error al obtener lista de servicios');

    const listaVehiculos = await respAutos.json();
    const listaServicios = await respServicios.json();

    // Mapear autos con servicio activo
    const serviciosActivosMap = new Map();
    listaServicios.forEach(serv => {
      const estado = serv.Estado ? serv.Estado.trim() : '';
      if (estado !== 'Finalizado' && estado !== 'Cancelado') {
        serviciosActivosMap.set(serv.IdAuto, estado);
      }
    });

    // Guardar en caché con la información de si está ocupado o no
    listaAutosCache = (listaVehiculos || []).map(auto => ({
      ...auto,
      enServicio: serviciosActivosMap.has(auto.IdAuto),
      estadoServicio: serviciosActivosMap.get(auto.IdAuto) || null
    }));

    // Poblar el DATALIST
    if (datalist) {
      datalist.innerHTML = '';
      listaAutosCache.forEach(auto => {
        const opt = document.createElement('option');
        if (auto.enServicio) {
          opt.value = `⛔ ${auto.Patente} - ${auto.Modelo || ''} (En servicio: ${auto.estadoServicio})`;
        } else {
          opt.value = `${auto.Patente} - ${auto.Modelo || ''}`;
        }
        datalist.appendChild(opt);
      });
    }

    // Compatibilidad en caso de que en otra vista aún exista un <select id="select_auto">
    if (select) {
      select.innerHTML = '<option value="">-- Seleccione un Vehículo --</option>';
      listaAutosCache.forEach(auto => {
        const option = document.createElement('option');
        option.value = auto.IdAuto;
        if (auto.enServicio) {
          option.textContent = `⛔ ${auto.Patente} - ${auto.Modelo} (En servicio: ${auto.estadoServicio})`;
          option.disabled = true;
        } else {
          option.textContent = `🚗 ${auto.Patente} - ${auto.Modelo}`;
        }
        select.appendChild(option);
      });
    }

    if (inputAuto) inputAuto.placeholder = 'Escribe o busca patente/modelo (ej: NMMS54)...';

  } catch (error) {
    console.error('Error al cargar la lista de vehículos:', error);
    if (inputAuto) inputAuto.placeholder = 'Error al cargar vehículos';
    if (select) select.innerHTML = '<option value="">Error al cargar vehículos</option>';
  }
}

// Listener para el input conectado al datalist
window.seleccionarVehiculoPorDatalist = function(valorIngresado) {
  const badgeCliente = document.getElementById('cliente_asociado_servicio');
  const inputAutoHidden = document.getElementById('servicio_id_auto_hidden');
  const inputClienteHidden = document.getElementById('servicio_id_cliente_hidden');

  if (!valorIngresado || !valorIngresado.trim()) {
    if (inputAutoHidden) inputAutoHidden.value = '';
    if (inputClienteHidden) inputClienteHidden.value = '';
    if (badgeCliente) badgeCliente.innerHTML = 'Cliente asociado: <em>N/A</em>';
    return;
  }

  // Si eligió uno marcado con ⛔ (en servicio)
  if (valorIngresado.startsWith('⛔')) {
    if (inputAutoHidden) inputAutoHidden.value = '';
    if (inputClienteHidden) inputClienteHidden.value = '';
    if (badgeCliente) {
      badgeCliente.innerHTML = '<span style="color: #ef4444; font-weight: 600;">⛔ Este vehículo ya tiene un servicio en curso.</span>';
    }
    return;
  }

  // Extraemos la patente limpia (primera palabra antes del guión o espacio)
  const patenteBuscada = valorIngresado.replace(/^[🚗\s]+/, '').split(' - ')[0].trim().toUpperCase();

  const autoEncontrado = listaAutosCache.find(a => 
    (a.Patente || a.patente || '').toUpperCase() === patenteBuscada
  );

  if (autoEncontrado) {
    if (autoEncontrado.enServicio) {
      if (inputAutoHidden) inputAutoHidden.value = '';
      if (inputClienteHidden) inputClienteHidden.value = '';
      if (badgeCliente) {
        badgeCliente.innerHTML = `<span style="color: #ef4444; font-weight: 600;">⛔ Ya está en servicio (${autoEncontrado.estadoServicio})</span>`;
      }
      return;
    }

    const idAuto = autoEncontrado.IdAuto || autoEncontrado.id;
    const idCliente = autoEncontrado.IdCliente || autoEncontrado.idCliente;
    const patente = autoEncontrado.Patente || autoEncontrado.patente;
    const nombreCliente = autoEncontrado.NombreCliente || autoEncontrado.nombreCliente || `ID ${idCliente}`;

    if (inputAutoHidden) inputAutoHidden.value = idAuto;
    if (inputClienteHidden) inputClienteHidden.value = idCliente;

    if (badgeCliente) {
      badgeCliente.innerHTML = `Cliente Asociado: <strong>${nombreCliente}</strong> (Patente: ${patente})`;
    }
  } else {
    if (inputAutoHidden) inputAutoHidden.value = '';
    if (inputClienteHidden) inputClienteHidden.value = '';
    if (badgeCliente) {
      badgeCliente.innerHTML = '<span style="color: #d97706;">⚠️ Escribe o selecciona una patente válida</span>';
    }
  }
};