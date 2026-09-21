import { apifetch, ENDPOINTS } from './api.js';
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
export function editarDetalleRapido(idServicio, columna, valorActual, nombreCampo) {
    const nuevoValor = prompt(`📝 Edición de ${nombreCampo} para el Servicio #${idServicio}:\n\nValor actual:\n${valorActual}\n\nIngrese el nuevo valor:`, valorActual);

    // 1. El usuario presionó Cancelar o no ingresó nada
    if (nuevoValor === null || nuevoValor === valorActual) {
        return; 
    }

    // 2. Preparar el objeto para PATCH
    const datosAActualizar = {};
    datosAActualizar[columna] = nuevoValor.trim();

    // 3. Confirmar y ejecutar la actualización
    if (confirm(`¿Está seguro de actualizar el ${nombreCampo} del Servicio #${idServicio}?`)) {
        actualizarServicio(idServicio, datosAActualizar); 
    }
}
/**
 * Actualiza solo el estado de un servicio.
 * @param {number} idServicio El ID del servicio.
 * @param {string} nuevoEstado El nuevo estado a asignar.
 */

export function actualizarEstadoRapido(idServicio, nuevoEstado) {
    if (confirm(`¿Desea cambiar el estado del Servicio #${idServicio} a "${nuevoEstado}"?`)) {
        // La clave debe coincidir con la columna en la DB (Estado)
        actualizarServicio(idServicio, { Estado: nuevoEstado }); 
    } else {
        // Opcional: recargar solo la tabla si el usuario cancela (para restablecer el select)
        obtenerServiciosPendientes();
    }
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
    if (!idCliente || !idAuto || !descripcionProblema||!estado||!idMecanico) {
        alert('❌ Error: Debe seleccionar un vehículo y describir el problema.');
        btn.disabled = false;
        btn.textContent = 'Asignar Servicio';
        return false;
    }
    const datosServicio = {
        IdCliente: parseInt(idCliente),
        IdAuto: parseInt(idAuto),
        FechaInicio: fechaActual,
        DescripcionProblema: descripcionProblema,
        Diagnostico: diagnostico,
        Estado: estado,
        Precio: parseFloat(precio)
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
           
            body:
            {
                IdServicio: parseInt(idServicioCreado),
                IdMecanico: parseInt(idMecanico)
            }
            
        });
        const resultado2 = await response2.json();

        if (response2.ok || response2.status === 201) {
            alert(`✅ Servicio #${idServicioCreado} asignado correctamente.`);
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

export async function obtenerServiciosPendientes(idMecanicoLogeado=localStorage.getItem('idMecanico')) {
    const tbody = document.querySelector('#tablaServicios tbody');
    tbody.innerHTML = '<tr><td colspan="8">Cargando servicios pendientes...</td></tr>'; 
    if (!idMecanicoLogeado) {
        tbody.innerHTML = '<tr><td colspan="8" style="color: orange;">⚠️ No se encontró la sesión del mecánico.</td></tr>';
        return;
    }
    
    try {
    const response = await apifetch(`${ENDPOINTS.ServiciosMecanicos}/Mecanico/${idMecanicoLogeado}`); // Cambiar "1" por el ID del mecánico actual si es dinámico
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const servicios = await response.json(); 
        
        tbody.innerHTML = ''; 
        
        if (servicios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay servicios pendientes actualmente.</td></tr>'; // colspan="8"
            return;
        }

        servicios.forEach(servicio => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = servicio.IdServicio;
            row.insertCell(1).textContent = servicio.FechaInicio; 
            row.insertCell(2).textContent = `${servicio.NombreCliente} (${servicio.RutCliente})`;
            row.insertCell(3).textContent = `${servicio.Modelo} (${servicio.Patente})`;

            // Columna 4: Problema (con botón de edición)
            const problemaDisplay = servicio.DescripcionProblema || '';
            const cellProblema = row.insertCell(4);
            cellProblema.innerHTML = `
                <span style="display: block; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${problemaDisplay}">
                    ${problemaDisplay}
                </span>
                <button 
                    onclick="editarDetalleRapido(${servicio.IdServicio}, 'DescripcionProblema', \`${problemaDisplay.replace(/`/g, '\\`')}\`, 'Descripción del Problema')" 
                    style="background: #007bff; color: white; border: none; padding: 2px 5px; cursor: pointer; border-radius: 3px; font-size: 0.75em; margin-top: 5px;">
                    ✏️
                </button>
            `;
            const cellPrecio = row.insertCell(5);
            cellPrecio.innerHTML = `<input type="number" 
                                    value="${servicio.Precio || 0}" 
                                    id="precio-${servicio.IdServicio}" 
                                    onchange="actualizarServicio(${servicio.IdServicio}, {Precio: this.value})"
                                    style="width: 100px; padding: 5px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">`;
            const cellEstado = row.insertCell(6);
            cellEstado.innerHTML = `
                <select 
                    id="estado-${servicio.IdServicio}" 
                    onchange="actualizarEstadoRapido(${servicio.IdServicio}, this.value)"
                    style="padding: 5px; border-radius: 4px;">
                    <option value="Pendiente" ${servicio.Estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En reparación" ${servicio.Estado === 'En reparación' ? 'selected' : ''}>En reparación</option>
                    <option value="Finalizado" ${servicio.Estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                    <option value="Cancelado" ${servicio.Estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            `;
            const cellAcciones = row.insertCell(7); 

            const diagnosticoActual = servicio.Diagnostico ? servicio.Diagnostico.replace(/`/g, '\\`') : ''; 

            cellAcciones.innerHTML = `
                <button 
                onclick="editarDetalleRapido(${servicio.IdServicio}, 'Diagnostico', \`${diagnosticoActual}\`, 'Diagnóstico')" 
                title="Editar Diagnóstico del Servicio"
                style="background-color: #ffc107; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">
                🔬 Diagnóstico
                </button>
                <button 
                    onclick="eliminarServicioPorId(${servicio.IdServicio})" 
                    title="Eliminar este servicio individual"
                    style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">
                    🗑️ Eliminar
                </button>
            `;
        });
        
    } catch (error) {
        console.error('Error al obtener servicios pendientes:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="color: red;">Error al conectar con el servidor para obtener servicios.</td></tr>'; // colspan="8"
    }
}