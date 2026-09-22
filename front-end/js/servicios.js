import { apifetch, ENDPOINTS } from './api.js';
import { cambiarPestanaA } from './tabs.js';
import { restablecerFormularioServicio } from './formulario.js';
import { modalConfirmar, modalPedirTexto,mostrarModalCliente } from './notificaciones.js';
/**
 * Elimina un solo servicio de la base de datos usando su ID único.
 * @param {number} idServicio El ID del servicio (IdServicio) a eliminar.
 */
export async function eliminarServicioPorId(idServicio) {
    if (!confirm(`⚠️ ¿Estás seguro de que quieres eliminar el servicio ID ${idServicio}?`)) {
        return;
    }

    try {
        const response = await apifetch(`${ENDPOINTS.Servicios}/${idServicio}`, {
            method: 'DELETE',
        });

        if (response.status === 204) {
            alert(`✅ Servicio ID ${idServicio} eliminado correctamente.`);
            // Recargar la tabla sin recargar toda la página
            obtenerServiciosPendientes();
        } else if (response.status === 404) {
            alert(`⚠️ Error 404: Servicio ID ${idServicio} no encontrado.`);
        } else {
            // Manejar otros errores (ej. 500 interno)
            const errorData = await response.json();
            alert(`❌ Error al eliminar servicio: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error de conexión al eliminar:', error);
        alert('❌ Fallo al conectar con el servidor para eliminar el servicio.');
    }
}

/**
 * Envía una solicitud PATCH para actualizar uno o más campos de un servicio.
 * @param {number} idServicio El ID del servicio a actualizar.
 * @param {object} datosAActualizar Un objeto con {columna: nuevoValor}.
 */
export async function actualizarServicio(idServicio, datosAActualizar) {
    if (Object.keys(datosAActualizar).length === 0) {
        alert("⚠️ No se enviaron datos para actualizar.");
        return;
    }
    
    // Convertir el precio a número si se está actualizando
    if (datosAActualizar.hasOwnProperty('Precio')) {
        datosAActualizar.Precio = datosAActualizar.Precio ? parseFloat(datosAActualizar.Precio) : null;
    }
    
    try {
        const response = await apifetch(`${ENDPOINTS.Servicios}/${idServicio}`, {
            method: 'PATCH',
            body: datosAActualizar
        });

        // 1. Verificar si la respuesta fue exitosa (código 2xx)
        if (response.ok) {
            // 2. Intentar leer el JSON solo si la respuesta tiene contenido (no falla en 204/200 vacío)
            let resultado;
            try {
                resultado = await response.json();
            } catch (e) {
                // Si falla la lectura del JSON, no pasa nada, solo es un mensaje vacío.
                resultado = { message: `Servicio #${idServicio} actualizado. (Respuesta sin cuerpo JSON)` };
            }
            
            console.log(`✅ Servicio #${idServicio} actualizado.`, datosAActualizar);
            
            // Si el estado es Finalizado, mostramos una alerta más clara
            if (datosAActualizar.Estado && datosAActualizar.Estado.toLowerCase() === 'finalizado') {
                alert(`✅ Servicio #${idServicio} finalizado. Cliente/Vehículo eliminados. ¡Listo para reingresar!`);
            }
            
            // Recargar la tabla para mostrar el cambio (y que desaparezca si se finalizó)
            obtenerServiciosPendientes();

        } else {
            // Manejar errores (códigos 4xx o 5xx)
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: response.statusText };
            }
            console.error('Error del servidor al actualizar:', errorData);
            alert(`❌ Error al actualizar servicio: ${errorData.error || errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error de conexión al actualizar:', error);
        alert('❌ Fallo al conectar con el servidor para actualizar el servicio.');
    }
}

/**
 * Pide un nuevo valor (Problema o Diagnóstico) y llama a actualizarServicio.
 * @param {number} idServicio El ID del servicio a actualizar.
 * @param {string} columna La columna de la base de datos a modificar ('DescripcionProblema' o 'Diagnostico').
 * @param {string} valorActual El valor actual del campo.
 * @param {string} nombreCampo Nombre visible para el usuario.
 */
export async function editarDetalleRapido(idServicio, campo, valorActual, etiqueta) {
  // En vez de: const nuevoValor = prompt(...)
  const nuevoValor = await modalPedirTexto(`Editar ${etiqueta} para el Servicio #${idServicio}:`, valorActual);

  if (nuevoValor === null || nuevoValor.trim() === '' || nuevoValor === valorActual) {
    return; // Canceló o no hizo cambios
  }

  // Llamas a tu endpoint de actualización normalmente...
  await actualizarServicio(idServicio, { [campo]: nuevoValor });
}
/**
 * Actualiza solo el estado de un servicio.
 * @param {number} idServicio El ID del servicio.
 * @param {string} nuevoEstado El nuevo estado a asignar.
 */

export async function actualizarEstadoRapido(idServicio, nuevoEstado) {
  // En vez de: if (!confirm(`¿Desea cambiar el estado...?`))
  const confirmado = await modalConfirmar(`¿Desea cambiar el estado del Servicio #${idServicio} a "${nuevoEstado}"?`);
  if (!confirmado) {
    obtenerServiciosPendientes(); // Restaurar el select a su valor anterior
    return;
  }

  await actualizarServicio(idServicio, { Estado: nuevoEstado });
}


export function actualizarClienteServicio() {
    const select = document.getElementById('select_auto');
    const selectedOption = select.options[select.selectedIndex];
    const clienteIdField = document.getElementById('servicio_id_cliente_hidden');
    const autoIdField = document.getElementById('servicio_id_auto_hidden');
    const clienteNombreDisplay = document.getElementById('cliente_asociado_servicio');

    if (selectedOption.value) {
        clienteIdField.value = selectedOption.dataset.idCliente;
        autoIdField.value = selectedOption.value; // El valor es IdAuto
        
        clienteNombreDisplay.textContent = `Cliente ID Asociado: ${selectedOption.dataset.idCliente} (Patente: ${selectedOption.dataset.patente})`;
        
    } else {
        clienteIdField.value = '';
        autoIdField.value = '';
        clienteNombreDisplay.textContent = 'Cliente asociado: N/A';
    }
}


const LIMITE_SERVICIOS = 3; // Umbral de sobrecarga

/**
 * Consulta y cuenta los servicios activos de un mecánico.
 */
async function obtenerServiciosActivosMecanico(idMecanico) {
    try {
        const res = await apifetch(`${ENDPOINTS.ServiciosMecanicos}/Mecanico/${idMecanico}`);
        if (!res.ok) return [];

        const servicios = await res.json();
        // Filtrar solo los servicios abiertos en el taller
        return servicios.filter(s => 
            s.Estado === 'Pendiente' || s.Estado === 'En reparación'
        );
    } catch (error) {
        console.error('Error al consultar carga del mecánico:', error);
        return [];
    }
}

export async function registrarServicio(event) {
    event.preventDefault(); 

    const btn = document.getElementById('btnRegistrarServicio');
    btn.disabled = true;
    btn.textContent = 'Asignando...';

    const idCliente = document.getElementById('servicio_id_cliente_hidden').value;
    const idAuto = document.getElementById('servicio_id_auto_hidden').value;
    const descripcionProblema = document.getElementById('descripcion_problema').value.trim();
    const diagnostico = document.getElementById('diagnostico_inicial').value.trim();
    const precio = document.getElementById('precio_servicio').value;
    const estado = document.getElementById('estado_servicio').value;
    const idMecanico = document.getElementById('selectMecanicoAsignar').value;
    const fechaActual = new Date().toISOString().split('T')[0];

    if (!idCliente || !idAuto || !descripcionProblema || !estado || !idMecanico) {
        alert('❌ Error: Debe seleccionar un vehículo y describir el problema.');
        btn.disabled = false;
        btn.textContent = 'Asignar Servicio';
        return false;
    }

    // --- VALIDACIÓN DE SOBRECARGA EN FRONTEND ---
    const serviciosActivos = await obtenerServiciosActivosMecanico(idMecanico);

    if (serviciosActivos.length >= LIMITE_SERVICIOS) {
        const confirmarSobrecarga = confirm(
            `⚠️ ALERTA DE SOBRECARGA:\n` +
            `Este mecánico ya tiene ${serviciosActivos.length} servicios activos en curso (límite recomendado: ${LIMITE_SERVICIOS}).\n\n` +
            `¿Deseas asignarle este servicio de todas formas?`
        );

        if (!confirmarSobrecarga) {
            btn.disabled = false;
            btn.textContent = 'Asignar Servicio';
            return false;
        }
    }

    const datosServicio = {
        IdCliente: parseInt(idCliente),
        IdAuto: parseInt(idAuto),
        FechaInicio: fechaActual,
        DescripcionProblema: descripcionProblema,
        Diagnostico: diagnostico,
        Estado: estado,
        Precio: parseFloat(precio) || 0
    };

    try {
        const response = await apifetch(ENDPOINTS.Servicios, {
            method: 'POST',
            body: datosServicio
        });
        const resultado = await response.json();

        if (!response.ok && response.status !== 201) { 
            console.error('Error del servidor:', resultado);
            alert(`❌ Error del servidor (${response.status}): ${resultado.error || 'Error al procesar la solicitud.'}`);
            return false;
        }

        const idServicioCreado = resultado.id || resultado.IdServicio || resultado.insertId;

        const response2 = await apifetch(ENDPOINTS.ServiciosMecanicos, {
            method: 'POST',
            body: {
                IdServicio: parseInt(idServicioCreado),
                IdMecanico: parseInt(idMecanico)
            }
        });
        const resultado2 = await response2.json();

        if (response2.ok || response2.status === 201) {
            alert(`✅ Servicio #${idServicioCreado} asignado correctamente.`);
            restablecerFormularioServicio();
            cambiarPestanaA('tab-listado');
           
            obtenerServiciosPendientes();
        } else {
            console.error('Error al vincular mecánico:', resultado2);
            alert(`⚠️ El servicio #${idServicioCreado} se creó, pero no se pudo asociar al mecánico.`);
        }
    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert('❌ Fallo al conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Asignar Servicio';
    }
    
    return false; 
}

export async function obtenerServiciosPendientes() {
  const tbody = document.querySelector('#tablaServicios tbody');
  if (!tbody) return;

  const rol = localStorage.getItem('rol');
  const idMecanico = localStorage.getItem('idMecanico');

  tbody.innerHTML = '<tr><td colspan="9">Cargando tareas...</td></tr>';

  try {
    const url = (rol === 'admin')
      ? ENDPOINTS.ServiciosMecanicosTodos
      : `${ENDPOINTS.ServiciosMecanicos}/Mecanico/${idMecanico}`;

    const response = await apifetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const servicios = await response.json();
    tbody.innerHTML = '';

    if (!servicios || servicios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">No hay tareas pendientes.</td></tr>';
      return;
    }

    servicios.forEach(servicio => {
      const row = tbody.insertRow();

      // Columna 0: ID
      row.insertCell(0).textContent = servicio.IdServicio;
      
      // Columna 1: Fecha
      row.insertCell(1).textContent = servicio.FechaInicio ? servicio.FechaInicio.split('T')[0] : 'S/F';
      
      // Columna 2: Cliente con Botón de Información
      const cellCliente = row.insertCell(2);
      cellCliente.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span>${servicio.NombreCliente} (${servicio.RutCliente})</span>
          <button 
            type="button" 
            class="btn-info-cliente-${servicio.IdServicio}" 
            title="Ver datos del cliente"
            style="background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; font-weight: bold; color: #1e293b; padding: 0; line-height: 1;">
            ℹ
          </button>
        </div>
      `;

      // Evento del botón de información: consulta el cliente por RUT
      const btnInfo = cellCliente.querySelector(`.btn-info-cliente-${servicio.IdServicio}`);
      btnInfo.addEventListener('click', async () => {
        try {
          const resCliente = await apifetch(`${ENDPOINTS.Clientes}/${servicio.RutCliente}`);
          if (!resCliente.ok) throw new Error("No se pudo obtener el cliente");
          
          const cliente = await resCliente.json();

          mostrarModalCliente({
            Nombre: cliente.Nombre,
            Rut: cliente.Rut,
            Telefono: cliente.NumeroTelefonico,
            Correo: cliente.CorreoElectronico,
            Vehiculo: servicio.Modelo,
            Patente: servicio.Patente
          });
        } catch (err) {
          console.error("Error al consultar cliente:", err);
          alert("No se pudo cargar la información del cliente.");
        }
      });

      // Columna 3: Auto
      row.insertCell(3).textContent = `${servicio.Modelo} (${servicio.Patente})`;

      // Columna 4: Mecánico Asignado
      const celdaMec = row.insertCell(4);
      celdaMec.textContent = servicio.NombreMecanico 
        ? `${servicio.NombreMecanico} (${servicio.EspecialidadMecanico || 'General'})`
        : '⚠️ Sin asignar';

      // Columna 5: Problema
      const problemaDisplay = servicio.DescripcionProblema || '';
      const cellProblema = row.insertCell(5);
      cellProblema.innerHTML = `
        <span style="display: block; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${problemaDisplay}">
          ${problemaDisplay}
        </span>
        <button 
          onclick="editarDetalleRapido(${servicio.IdServicio}, 'DescripcionProblema', \`${problemaDisplay.replace(/`/g, '\\`')}\`, 'Descripción')" 
          style="background: #1f2937; color: white; border: none; padding: 2px 5px; cursor: pointer; border-radius: 3px; font-size: 0.75em;">
          ✏️
        </button>
      `;

      // Columna 6: Precio
      const cellPrecio = row.insertCell(6);
      cellPrecio.innerHTML = `
        <input type="number" 
          value="${servicio.Precio || 0}" 
          id="precio-${servicio.IdServicio}" 
          onchange="actualizarServicio(${servicio.IdServicio}, {Precio: this.value})"
          style="width: 85px; padding: 4px; border-radius: 4px; border: 1px solid #ccc;">
      `;

      // Columna 7: Estado
      const cellEstado = row.insertCell(7);
      cellEstado.innerHTML = `
        <select 
          id="estado-${servicio.IdServicio}" 
          onchange="actualizarEstadoRapido(${servicio.IdServicio}, this.value)"
          style="padding: 4px; border-radius: 4px;">
          <option value="Pendiente" ${servicio.Estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En reparación" ${servicio.Estado === 'En reparación' ? 'selected' : ''}>En reparación</option>
          <option value="Finalizado" ${servicio.Estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
          <option value="Cancelado" ${servicio.Estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      `;

      // Columna 8: Acciones
      const cellAcciones = row.insertCell(8);
      const diagnosticoActual = servicio.Diagnostico ? servicio.Diagnostico.replace(/`/g, '\\`') : '';
      cellAcciones.innerHTML = `
        <button 
          onclick="editarDetalleRapido(${servicio.IdServicio}, 'Diagnostico', \`${diagnosticoActual}\`, 'Diagnóstico')" 
          style="background-color: #ffc107; color: black; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">
          🔬
        </button>
        <button 
          onclick="eliminarServicioPorId(${servicio.IdServicio})" 
          style="background-color: #dc3545; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">
          🗑️
        </button>
      `;
    });

  } catch (error) {
    console.error('Error al obtener servicios:', error);
    tbody.innerHTML = '<tr><td colspan="9" style="color: red;">Error al conectar con el servidor.</td></tr>';
  }
}