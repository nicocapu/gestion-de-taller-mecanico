export const API_BASE_URL = "http://localhost:3000";
export const ENDPOINTS = {
        Clientes: `${API_BASE_URL}/Cliente`,
        Vehiculos: `${API_BASE_URL}/Auto`,
        Servicios: `${API_BASE_URL}/Servicio`,
        ServiciosMecanicos: `${API_BASE_URL}/ServicioMecanico`,
        Mecanicos: `${API_BASE_URL}/Mecanico`,
        Login: `${API_BASE_URL}/signin`,
}
export async function apifetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'x-access-token': token,
        ...options.headers
    };
    const config = { 
        ...options,
         headers };
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    const response = await fetch(url, config);
    return response;

};


