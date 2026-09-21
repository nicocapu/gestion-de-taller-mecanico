// --- Expresiones Regulares para Patentes Chilenas ---
// 1. Patente Antigua (ej: AB·1234): 2 letras y 4 números.
const patenteAntigua_REGEX = /^[A-Z]{2}[0-9]{4}$/; 

// 2. Patente Nueva (ej: BC·34·FG): 2 letras, 2 números, 2 letras.
const patenteNueva_REGEX = /^[A-Z]{4}[0-9]{2}$/; 
/**
 * Valida el formato de una Patente de Vehículo Chilena (antigua o nueva).
 * NOTA: La validación de patente es SOLO de formato, NO usa Módulo 11.
 * @param {string} Patente La patente ingresada (ej: "BC34FG", "AB1234").
 * @returns {boolean} true si el formato es válido, false en caso contrario.
 */
export function validarPatente(Patente) {
    // PASO 1: Limpiar y estandarizar la entrada
    // Quita puntos, guiones, espacios y convierte a mayúsculas para la verificación.
    const patenteLimpia = Patente.replace(/[\s\-\.]/g, '').toUpperCase();
    
    // PASO 2: Validación de Formato (RegEx)
    // Se valida contra el formato Antiguo O el formato Nuevo.
    if (patenteAntigua_REGEX.test(patenteLimpia) || patenteNueva_REGEX.test(patenteLimpia)) {
        // console.log("Formato de Patente correcto.");
        return true;
    } else {
        console.error("Fallo: Formato de Patente incorrecto.");
        return false;
    }
}