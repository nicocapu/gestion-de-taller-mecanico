// -----------------------------
// frontend/conexion.js (CÓDIGO COMPLETO Y FUNCIONAL CORREGIDO)
// -----------------------------

// ⭐ ENDPOINTS
const API_CLIENTES_URL = 'http://localhost:3000/clientes'; 
const API_VEHICULOS_URL = 'http://localhost:3000/Auto'; 
const API_SERVICIOS_URL = 'http://localhost:3000/servicios'; 
const API_SERVICIOS_PENDIENTES_URL = 'http://localhost:3000/servicios/pendientes'; 
const API_SERVICIOS_PATENTE_URL = 'http://localhost:3000/servicios/patente'; // Nuevo endpoint para DELETE por patente

// Variable global para almacenar el listado de vehículos
let listaVehiculos = []; 

// =================================================================
// LÓGICA DE MANEJO DE PESTAÑAS (TABS)
// =================================================================
import { validarRut } from './validar-rut.js';
import { validarPatente } from './validar-patente.js';
/**
 * Función auxiliar para cambiar a una pestaña específica.
 * @param {string} targetId El ID del contenido de la pestaña ('tab-registro', 'tab-servicios', etc.)
 */
function cambiarPestanaA(targetId) {
    // 1. Desactivar todos los botones y paneles
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // 2. Activar el panel (contenido)
    const targetPane = document.getElementById(targetId);
    if (targetPane) {
        targetPane.classList.add('active');
        // 3. Activar el botón correspondiente
        const targetButton = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
}

/**
 * Configura los event listeners para los botones de las pestañas.
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;

            // Llama a la función de utilidad para cambiar la vista
            cambiarPestanaA(targetId);
            
            // Lógica extra: Si activamos el listado, forzar la recarga de datos
            if (targetId === 'tab-listado') {
                obtenerServiciosPendientes();
            }
            
            // Lógica extra: Si activamos la sección de servicio, forzar la carga de autos
            if (targetId === 'tab-servicios') {
                cargarVehiculosEnSelect(); 
            }
            if (targetId === 'tab-mecanicos') {
                // Llama a la función definida en el otro archivo JS
                cargarListaMecanicos(); 
            }
        });
    });
}


// =================================================================
// LÓGICA DE ELIMINACIÓN DE SERVICIO POR ID (DELETE)
// =================================================================

/**
 * Elimina un solo servicio de la base de datos usando su ID único.
 * @param {number} idServicio El ID del servicio (IdServicio) a eliminar.
 */
async function eliminarServicioPorId(idServicio) {
    if (!confirm(`⚠️ ¿Estás seguro de que quieres eliminar el servicio ID ${idServicio}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_SERVICIOS_URL}/${idServicio}`, {
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
 * Elimina todos los servicios asociados a una patente específica.
 * @param {string} patente La patente del vehículo cuyos servicios se eliminarán.
 */
async function eliminarServiciosPorPatente(patente) {
    if (!confirm(`⚠️ ¿Estás seguro de que quieres ELIMINAR TODOS los servicios asociados a la patente ${patente}? Esta acción es irreversible.`)) {
        return;
    }
    
    const url = `${API_SERVICIOS_PATENTE_URL}/${patente}`;
    
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        const resultado = await response.json();
        
        if (response.ok) {
            alert(`✅ Eliminación exitosa: ${resultado.message}`);
            // Si la eliminación fue exitosa y estamos en la pestaña de listado, actualizamos:
            if (document.querySelector('.tab-pane.active')?.id === 'tab-listado') {
                obtenerServiciosPendientes();
            }
        } else {
            console.error('Error del servidor:', resultado);
            alert(`❌ Error al eliminar servicios: ${resultado.error || resultado.message}`);
        }
    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert('❌ Fallo al conectar con el servidor para eliminar servicios.');
    }
}

// =================================================================
// LÓGICA DE ACTUALIZACIÓN DE SERVICIO POR ID (PATCH) - CORREGIDA
// =================================================================

/**
 * Envía una solicitud PATCH para actualizar uno o más campos de un servicio.
 * @param {number} idServicio El ID del servicio a actualizar.
 * @param {object} datosAActualizar Un objeto con {columna: nuevoValor}.
 */
async function actualizarServicio(idServicio, datosAActualizar) {
    if (Object.keys(datosAActualizar).length === 0) {
        alert("⚠️ No se enviaron datos para actualizar.");
        return;
    }
    
    // Convertir el precio a número si se está actualizando
    if (datosAActualizar.hasOwnProperty('Precio')) {
        datosAActualizar.Precio = datosAActualizar.Precio ? parseFloat(datosAActualizar.Precio) : null;
    }
    
    try {
        const response = await fetch(`${API_SERVICIOS_URL}/${idServicio}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosAActualizar)
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
function editarDetalleRapido(idServicio, columna, valorActual, nombreCampo) {
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
function actualizarEstadoRapido(idServicio, nuevoEstado) {
    if (confirm(`¿Desea cambiar el estado del Servicio #${idServicio} a "${nuevoEstado}"?`)) {
        // La clave debe coincidir con la columna en la DB (Estado)
        actualizarServicio(idServicio, { Estado: nuevoEstado }); 
    } else {
        // Opcional: recargar solo la tabla si el usuario cancela (para restablecer el select)
        obtenerServiciosPendientes();
    }
}

// =================================================================
// FUNCIONES DE TRANSICIÓN DE FORMULARIOS
// =================================================================

/**
 * Habilita el formulario de vehículo y realiza la transición de pantalla (dentro de la pestaña de registro).
 */
function habilitarFormularioVehiculo(nombre, rut, clienteId) {
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

/**
 * Restablece la pantalla de vehículo al formulario de cliente.
 */
function restablecerFormularioVehiculo() {
    document.getElementById('seccionVehiculo').style.display = 'none'; 
    document.getElementById('seccionCliente').style.display = 'block'; 
    
    document.getElementById('cliente_id_hidden').value = '';
    document.getElementById('cliente_asociado_nombre').textContent = '¡Registre un cliente primero!';
    document.getElementById('cliente_asociado_nombre').style.color = 'red';
    
    document.getElementById('formularioCliente').reset(); 
}

/**
 * Transición de pantalla de Vehículo a Servicio (y cambia de pestaña).
 */
function habilitarFormularioServicio() {
    // Volvemos a mostrar el formulario de cliente (para la próxima vez que registren)
    restablecerFormularioVehiculo(); 
    
    // CAMBIAR A LA PESTAÑA DE SERVICIOS
    cambiarPestanaA('tab-servicios');

    // Limpia y carga la lista de autos
    document.getElementById('formularioServicio').reset();
    cargarVehiculosEnSelect(); 
}

/**
 * Restablece la pantalla de servicio y vuelve al formulario de Cliente (primera pestaña).
 */
function restablecerFormularioServicio() {
    document.getElementById('formularioServicio').reset(); 
    // Volver a la pestaña de registro
    cambiarPestanaA('tab-registro');
    // Asegurarse de que muestre el formulario de Cliente
    restablecerFormularioVehiculo(); 
}


// =================================================================
// LÓGICA DE REGISTRO DE CLIENTE (POST)
// =================================================================

async function registrarCliente(event) {
    event.preventDefault(); 
    
    const btn = document.getElementById('btnRegistrarCliente');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const rut = document.getElementById('rut_cliente').value.trim();
    const nombre = document.getElementById('nombre_cliente').value.trim();
    const telefonoFrontend = document.getElementById('telefono_cliente').value.trim();
    
    if (!validarRut(rut)) {
        alert('❌ Error: El RUT no tiene el formato correcto (Ej: 12.345.678-9). No se permiten letras ni formatos incorrectos.');
        document.getElementById('rut_cliente').focus();
        btn.disabled = false;
        btn.textContent = 'Registrar Cliente';
        return false;
    }

    if (!rut || !nombre) {
        alert('❌ Error: El RUT y el Nombre son obligatorios.');
        btn.disabled = false;
        btn.textContent = 'Registrar Cliente';
        return false;
    }

    const datosCliente = {
        rut: rut,
        nombre: nombre,
        numeroTelefonico: telefonoFrontend 
    };

    try {
        const response = await fetch(API_CLIENTES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCliente)
        });

        const resultado = await response.json();

        if (response.ok || response.status === 201) { 
            alert(`✅ Cliente "${nombre}" registrado correctamente. Continúe con el vehículo.`);
            
            const nuevoClienteId = resultado.id; 
            if (nuevoClienteId) {
                habilitarFormularioVehiculo(nombre, rut, nuevoClienteId);
            } else {
                 alert('⚠️ Cliente registrado, pero el servidor no devolvió el ID necesario. Verifique el backend.');
            }
        } else {
            console.error('Error del servidor:', resultado);
            alert(`❌ Error del servidor (${response.status}): ${resultado.error || 'Error al procesar la solicitud.'}`);
        }

    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert('❌ Fallo al conectar con el servidor. Verifique que el backend esté activo.');
    } finally {
        // Solo re-habilitamos si no hubo transición de pantalla (fallo)
        if (document.getElementById('seccionVehiculo').style.display === 'none') {
            btn.disabled = false;
            btn.textContent = 'Registrar Cliente';
        }
    }
    
    return false;
}


// =================================================================
// LÓGICA DE REGISTRO DE VEHÍCULO (POST)
// =================================================================

async function registrarVehiculo(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btnRegistrarVehiculo');
    
    const clienteId = document.getElementById('cliente_id_hidden').value.trim(); 
    const patente = document.getElementById('patente_vehiculo').value.trim();
    const patenteLimpia = patente.replace(/[\s\-\.]/g, '').toUpperCase();
    const modelo = document.getElementById('modelo_vehiculo').value.trim();
    const color = document.getElementById('color_vehiculo').value.trim();
    const anio = document.getElementById('anio_vehiculo').value.trim();
    
    if (!clienteId || !patente || !modelo) {
        alert('❌ Error: El Cliente, Patente y Modelo son obligatorios.');
        return false; 
    }

    if (!validarPatente(patente)) {
        alert('❌ Error: La patente no tiene el formato correcto');
        document.getElementById('patente_vehiculo').focus();
        btn.disabled = false;
        btn.textContent = 'Registrar Vehiculo';
        return false;
    }
    if (anio && (anio.length !== 4 || isNaN(anio) || anio < 1900 || anio > new Date().getFullYear() + 1)) {
    alert('❌ Error: El Año del vehículo debe ser un número de 4 dígitos válido (entre 1900 y el año actual).');
    document.getElementById('anio_vehiculo').focus();
    btn.disabled = false;
    btn.textContent = 'Registrar Vehiculo';
    return false;
}
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    
    const datosVehiculo = {
        clienteId: clienteId, 
        patente: patenteLimpia,
        modelo: modelo,
        color: color,
        anio: anio || null // Enviar null si está vacío
    };

    try {
        const response = await fetch(API_VEHICULOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVehiculo)
        });

        const resultado = await response.json();

        if (response.ok || response.status === 201) { 
            alert(`✅ Vehículo con patente ${patente} registrado correctamente. ¡Proceda a asignar el servicio!`);
            
            // ⭐ TRANSICIÓN CRÍTICA: CAMBIAR A LA PESTAÑA DE SERVICIOS
            habilitarFormularioServicio(); 

        } else {
            console.error('Error del servidor:', resultado);
            alert(`❌ Error del servidor (${response.status}): ${resultado.error || 'Error al procesar la solicitud.'}`);
            
        }

    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert('❌ Fallo al conectar con el servidor.');
        
    } finally {
        btn.disabled = false;
        btn.textContent = 'Registrar Vehículo y Asignar Servicio';
    }
    
    return false; 
}


// =================================================================
// LÓGICA DE ASIGNACIÓN DE SERVICIO (POST & GET)
// =================================================================

/**
 * Carga la lista de vehículos desde el backend y llena el SELECT.
 */
async function cargarVehiculosEnSelect() {
    const select = document.getElementById('select_auto');
    select.innerHTML = '<option value="">Cargando vehículos...</option>';
    
    try {
        const response = await fetch(API_VEHICULOS_URL);
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


/**
 * Actualiza los campos ocultos de Cliente e Auto ID cuando el usuario selecciona un vehículo.
 */
function actualizarClienteServicio() {
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


async function registrarServicio(event) {
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
    if (!idCliente || !idAuto || !descripcionProblema||!estado||!idMecanico) {
        alert('❌ Error: Debe seleccionar un vehículo y describir el problema.');
        btn.disabled = false;
        btn.textContent = 'Asignar Servicio';
        return false;
    }
    const datosServicio = {
        idCliente: idCliente, 
        idAuto: idAuto,
        descripcionProblema: descripcionProblema,
        diagnostico: diagnostico,
        precio: precio,
        estado: estado,
        idMecanico: idMecanico
    };

    try {
        const response = await fetch(API_SERVICIOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosServicio)
        });

        const resultado = await response.json();

        if (response.ok || response.status === 201) { 
            alert(`✅ Servicio # ${resultado.id} asignado correctamente.`);
            
            // CAMBIAR A PESTAÑA DE LISTADO
            cambiarPestanaA('tab-listado');
            obtenerServiciosPendientes();

        } else {
            console.error('Error del servidor:', resultado);
            alert(`❌ Error del servidor (${response.status}): ${resultado.error || 'Error al procesar la solicitud.'}`);
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


// =================================================================
// LÓGICA DE LISTADO DE SERVICIOS (GET)
// =================================================================

/**
 * Obtiene la lista de servicios pendientes y la dibuja en la tabla.
 */
async function obtenerServiciosPendientes() {
    const tbody = document.querySelector('#tablaServicios tbody');
    // La tabla ahora tiene 8 columnas (colspan="8")
    tbody.innerHTML = '<tr><td colspan="8">Cargando servicios pendientes...</td></tr>'; 
    
    try {
        const response = await fetch(API_SERVICIOS_PENDIENTES_URL);
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
            
            // Columna 0: ID
            row.insertCell(0).textContent = servicio.IdServicio;
            // Columna 1: Fecha Ingreso
            row.insertCell(1).textContent = servicio.FechaInicio; 
            // Columna 2: Cliente (RUT)
            row.insertCell(2).textContent = `${servicio.NombreCliente} (${servicio.RutCliente})`;
            // Columna 3: Vehículo (Patente)
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

            // ⭐ Columna 5: PRECIO EST. (Editable con Input) ⭐
            const cellPrecio = row.insertCell(5);
            // Aseguramos que el input se vea bien y que el onchange llame a actualizarServicio
            cellPrecio.innerHTML = `<input type="number" 
                                    value="${servicio.Precio || 0}" 
                                    id="precio-${servicio.IdServicio}" 
                                    onchange="actualizarServicio(${servicio.IdServicio}, {Precio: this.value})"
                                    style="width: 100px; padding: 5px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">`;
                                    
            // ⭐ Columna 6: ESTADO (Select editable) ⭐
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
            
            // ⭐ Columna 7: ACCIONES (Diagnóstico + Eliminar) ⭐
            const cellAcciones = row.insertCell(7); 
            // Limpiar el diagnóstico de comillas para pasarlo al prompt
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