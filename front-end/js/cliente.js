import { habilitarFormularioVehiculo, restablecerFormularioVehiculo, habilitarFormularioServicio, restablecerFormularioServicio } from './formulario.js';
import { validarRut } from './validar-rut.js'; 
import { ENDPOINTS, apifetch } from './api.js';
export async function registrarCliente(event) {
    event.preventDefault(); 
    
    const btn = document.getElementById('btnRegistrarCliente');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const rut = document.getElementById('rut_cliente').value.trim();
    const nombre = document.getElementById('nombre_cliente').value.trim();
    const telefonoFrontend = document.getElementById('telefono_cliente').value.trim();
    const correo= document.getElementById('correo_cliente').value.trim()
    
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
    Rut: rut,
    Nombre: nombre,
    NumeroTelefonico: telefonoFrontend,
    CorreoElectronico: correo
    };

    try {
        const response = await apifetch(ENDPOINTS.Clientes, {
            method: 'POST',
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
