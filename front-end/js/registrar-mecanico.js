import { apifetch, ENDPOINTS } from "./api.js";
let listaMecanicos = [];

document.getElementById('formularioMecanico').addEventListener('submit', async function(event) {
    event.preventDefault();

    const btn = document.getElementById('btnRegistrarMecanico');
    const nombre = document.getElementById('nombre_mecanico').value.trim();
    const correo = document.getElementById('correo_mecanico').value.trim();
    const password = document.getElementById('password_mecanico').value.trim();
    const especialidad = document.getElementById('especialidad_mecanico').value;
    const token = localStorage.getItem('token');

    if (!nombre || !correo || !password || !especialidad) {
        alert("Todos los campos son obligatorios");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Guardando...";

    const datosMecanico = { 
        Nombre: nombre,
        Correo: correo,
        Contrasenia: password,
        Especialidad: especialidad
    };

    try {
        const response = await apifetch(ENDPOINTS.Mecanicos, {
            method: 'POST',
            body: datosMecanico
        });

        if (response.ok) {
            alert("✅ Mecánico registrado correctamente");
            document.getElementById('formularioMecanico').reset();
            cargarListaMecanicos();
            cargarOpcionesMecanicos(); 
            const txtClave = document.getElementById('claveGeneradaTexto');
            if (txtClave) txtClave.textContent = '';
        } else {
            alert("❌ Error al registrar mecánico");
        }
    } catch (error) {
        console.error(error);
        alert("❌ Error de conexión");
    } finally {
        btn.disabled = false;
        btn.textContent = "Agregar Mecánico";
    }
});

export function MecanicosFiltrados(mecanicos) {
    // Busca el select de asignación o el de listado
    const select = document.getElementById('selectMecanicoAsignar') || document.getElementById('select_mecanico');
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar Mecánico --</option>';

    if (!mecanicos || mecanicos.length === 0) {
        select.innerHTML = '<option value="">No hay mecánicos disponibles</option>';
        return;
    }

    mecanicos.forEach(m => {
        const option = document.createElement('option');
        option.value = m.IdMecanico || m.id;
        const esp = m.Especialidad || m.especialidad;
        option.textContent = esp ? `${m.Nombre || m.nombre} (${esp})` : (m.Nombre || m.nombre);
        select.appendChild(option);
    });
}

export async function cargarListaMecanicos() {
    const tbody = document.querySelector('#tablaMecanicos tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const response = await apifetch(ENDPOINTS.Mecanicos);
        const mecanicos = await response.json();

        tbody.innerHTML = '';
        if (!mecanicos || mecanicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay mecánicos registrados.</td></tr>';
            return;
        }

        mecanicos.forEach(m => {
            const row = tbody.insertRow();
            const id = m.IdMecanico || m.id;
            const rolActual = (m.ROL || m.Rol || 'mecanico').toLowerCase();
            const esAdmin = rolActual === 'admin';

            // Columna 0: ID
            row.insertCell(0).textContent = id;
            // Columna 1: Nombre
            row.insertCell(1).textContent = m.Nombre || m.nombre;
            // Columna 2: Correo
            row.insertCell(2).textContent = m.Correo || m.correo;
            // Columna 3: Estado / Servicios
            row.insertCell(3).textContent = "Activo";

            // Columna 4: Botón Cambiar Rol
            const cellRol = row.insertCell(4);
            const textoBoton = esAdmin ? '⬇️ Pasar a Mecánico' : '⬆️ Ascender a Admin';
            const colorBoton = esAdmin ? '#6c757d' : '#28a745';
            const badgeRol = esAdmin 
                ? '<span style="background:#e8f4fd; color:#0d6efd; padding:2px 6px; border-radius:4px; font-size:0.85em; font-weight:bold; margin-right:8px;">ADMIN</span>'
                : '<span style="background:#e9ecef; color:#495057; padding:2px 6px; border-radius:4px; font-size:0.85em; font-weight:bold; margin-right:8px;">MECÁNICO</span>';

            cellRol.innerHTML = `
                ${badgeRol}
                <button 
                    onclick="alternarRolMecanico(${id}, '${rolActual}')"
                    style="background-color: ${colorBoton}; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 0.8em;">
                    ${textoBoton}
                </button>
            `;
        });

    } catch (error) {
        console.error("Error cargando mecánicos:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;">Error al cargar datos.</td></tr>';
    }
}

export async function cargarOpcionesMecanicos() {
    const selectRegistro = document.getElementById('selectMecanicoAsignar');
    const selectListado = document.getElementById('select_mecanico');
    const filtroEspecialidad = document.getElementById('filtro_especialidad');

    if (selectRegistro) selectRegistro.innerHTML = '<option value="">Cargando...</option>';
    if (selectListado) selectListado.innerHTML = '<option value="">Cargando...</option>';

    try {
        const response = await apifetch(ENDPOINTS.Mecanicos);
        const todosLosUsuarios = await response.json(); // Solo una lectura del body

        // Excluir administradores
        listaMecanicos = todosLosUsuarios.filter(m => {
            const rol = (m.Rol || m.rol || '').toLowerCase();
            return rol !== 'admin';
        });

        // Poblamos el select con los mecánicos filtrados
        MecanicosFiltrados(listaMecanicos);

        // Listener del filtro por especialidad
        if (filtroEspecialidad && !filtroEspecialidad.dataset.listenerAsignado) {
            filtroEspecialidad.addEventListener('change', (e) => {
                const seleccion = e.target.value;
                if (!seleccion || seleccion === 'Todas') {
                    MecanicosFiltrados(listaMecanicos);
                } else {
                    const filtrados = listaMecanicos.filter(m => 
                        (m.Especialidad || m.especialidad || '').trim().toLowerCase() === seleccion.trim().toLowerCase()
                    );
                    MecanicosFiltrados(filtrados);
                }
            });
            filtroEspecialidad.dataset.listenerAsignado = "true";
        }

    } catch (error) {
        console.error("Error cargando opciones de mecánicos:", error);
        if (selectRegistro) selectRegistro.innerHTML = '<option value="">Error al cargar</option>';
        if (selectListado) selectListado.innerHTML = '<option value="">Error al cargar</option>';
    }
}

export async function alternarRolMecanico(idMecanico, rolActual) {
    const nuevoRol = rolActual.toLowerCase() === 'admin' ? 'mecanico' : 'admin';
    const confirmacion = confirm(`¿Deseas cambiar el rol de este usuario a "${nuevoRol.toUpperCase()}"?`);
    if (!confirmacion) return;

    try {
        const response = await apifetch(`${ENDPOINTS.Mecanicos}/${idMecanico}`, {
            method: 'PATCH',
            body: { ROL: nuevoRol }
        });

        if (response.ok) {
            await cargarListaMecanicos();
            await cargarOpcionesMecanicos();
        } else {
            const error = await response.json().catch(() => ({}));
            alert(`❌ Error al actualizar el rol: ${error.message || response.statusText}`);
        }
    } catch (err) {
        console.error('Error al cambiar rol:', err);
        alert('❌ Error de conexión al actualizar el rol.');
    }
}