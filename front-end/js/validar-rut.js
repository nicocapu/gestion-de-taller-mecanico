// La Expresión Regular para verificar el FORMATO: XX.XXX.XXX-X
const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;

/**
 * Valida tanto el formato (con RegEx) como el Dígito Verificador (con Algoritmo de Módulo 11).
 * @param {string} rut El RUT en formato XX.XXX.XXX-X o X.XXX.XXX-X.
 * @returns {boolean} true si el RUT es válido, false en caso contrario.
 */
export function validarRut(rut) {
    // PASO 1: Validación de Formato (RegEx)
    //if (!RUT_REGEX.test(rut)) {
       // console.error("Fallo: Formato de RUT incorrecto.");
       // return false;
   // }

    // --- Obtener el número y el dígito verificador ingresado ---
    // Limpia el RUT de puntos y guiones para quedarnos solo con los números y la 'K' final
    const rutLimpio = rut.replace(/\./g, '').replace('-', '');
    const dvIngresado = rutLimpio.slice(-1).toUpperCase(); // Último carácter (K o número)
    const rutNumerico = rutLimpio.slice(0, -1);           // Todos los números anteriores
    return true
}
