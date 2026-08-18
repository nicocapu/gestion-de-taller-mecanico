// frontend/registrar-mecanico.js

const API_MECANICOS_URL = 'http://localhost:3000/mecanicos';

// =================================================================
// REGISTRAR MECÁNICO (POST)
// =================================================================
document.getElementById('formularioMecanico').addEventListener('submit', async function(event) {
    event.preventDefault();

    const btn = document.getElementById('btnRegistrarMecanico');
    const nombre = document.getElementById('nombre_mecanico').value.trim();
    const correo = document.getElementById('correo_mecanico').value.trim();
    const password = document.getElementById('password_mecanico').value.trim();

    if (!nombre || !correo || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Guardando...";

    const datosMecanico = { nombre, correo, password };

    try {
        const response = await fetch(API_MECANICOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMecanico)
        });

        if (response.ok) {
            alert("✅ Mecánico registrado correctamente");
            document.getElementById('formularioMecanico').reset();
            cargarListaMecanicos(); // Recargar la tabla
            cargarOpcionesMecanicos(); // Recargar los selects
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

// =================================================================
// CARGAR TABLA DE MECÁNICOS (GET)
// =================================================================
async function cargarListaMecanicos() {
    const tbody = document.querySelector('#tablaMecanicos tbody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    try {
        const response = await fetch(API_MECANICOS_URL);
        const mecanicos = await response.json();

        tbody.innerHTML = '';
        if (!mecanicos || mecanicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay mecánicos registrados.</td></tr>';
            return;
        }

        mecanicos.forEach(m => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = m.IdMecanico || m.id; // Ajusta según tu DB
            row.insertCell(1).textContent = m.Nombre || m.nombre;
            row.insertCell(2).textContent = m.Correo || m.correo;
            row.insertCell(3).textContent = "Activo"; // O el estado que tengas
        });

    } catch (error) {
        console.error("Error cargando mecánicos:", error);
        tbody.innerHTML = '<tr><td colspan="4">Error al cargar datos.</td></tr>';
    }
}

// =================================================================
// CARGAR SELECTS (Desplegables) DE MECÁNICOS
// =================================================================
async function cargarOpcionesMecanicos() {
    const selectRegistro = document.getElementById('selectMecanicoAsignar');
    const selectListado = document.getElementById('select_mecanico');
    const selects = [selectRegistro, selectListado];

    selects.forEach(s => {
        if (s) s.innerHTML = '<option value="">Cargando...</option>';
    });

    try {
        const response = await fetch(API_MECANICOS_URL);
        const mecanicos = await response.json();

        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">-- Seleccionar Mecánico --</option>';
            
            mecanicos.forEach(m => {
                const option = document.createElement('option');
                option.value = m.IdMecanico || m.id;
                option.textContent = m.Nombre || m.nombre;
                select.appendChild(option);
            });
        });

    } catch (error) {
        console.error("Error cargando opciones de mecánicos:", error);
        selects.forEach(s => {
            if (s) s.innerHTML = '<option value="">Error al cargar</option>';
        });
    }
}

// =================================================================
// GENERADOR DE CLAVE SEGURA PARA EL FORM DE MECÁNICOS
// =================================================================
function generarClaveSegura(longitud = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let clave = '';
    for (let i = 0; i < longitud; i++) {
        const index = Math.floor(Math.random() * chars.length);
        clave += chars.charAt(index);
    }
    return clave;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnGen = document.getElementById('btnGenerarClave');
    const inputPass = document.getElementById('password_mecanico');
    const txtClave = document.getElementById('claveGeneradaTexto');

    if (btnGen && inputPass) {
        btnGen.addEventListener('click', () => {
            const clave = generarClaveSegura(10);
            inputPass.value = clave;
            if (txtClave) {
                txtClave.textContent = `Clave sugerida: ${clave}`;
            } else {
                alert(`Clave sugerida: ${clave}`);
            }
        });
    }
});

