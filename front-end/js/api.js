export const API_BASE_URL =  'https://gestion-de-taller-mecanico-production.up.railway.app';
export const ENDPOINTS = {
        Clientes: `${API_BASE_URL}/Cliente`,
        Vehiculos: `${API_BASE_URL}/Auto`,
        Servicios: `${API_BASE_URL}/Servicio`,
        ServiciosMecanicos: `${API_BASE_URL}/ServicioMecanico`,
        Mecanicos: `${API_BASE_URL}/Mecanico`,
        Login: `${API_BASE_URL}/signin`,
        ServiciosMecanicosTodos:`${API_BASE_URL}/ServicioMecanico/todos`
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


