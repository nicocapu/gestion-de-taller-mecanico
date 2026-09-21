const API_LOGIN_MECANICOS_URL = 'http://localhost:3000/signin';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formLogin');
    const mensajeError = document.getElementById('mensaje-error-login');
    const btnLogin = document.getElementById('btnLogin');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        mensajeError.textContent = '';

        const correo = document.getElementById('correo_login').value.trim();
        const password = document.getElementById('password_login').value.trim();

        if (!correo || !password) {
            mensajeError.textContent = 'Debe ingresar correo y contraseña.';
            return;
        }

        btnLogin.disabled = true;
        btnLogin.textContent = 'Ingresando...';

        try {
            const response = await fetch(API_LOGIN_MECANICOS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    Correo: correo, 
                    Contrasenia: password 
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    mensajeError.textContent = 'Correo o contraseña incorrectos.';
                } else {
                    mensajeError.textContent = 'Error al intentar iniciar sesión.';
                }
                return;
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('idMecanico', data.idMecanico);
            window.location.href = './vista_taller_mecanico.html';
        } catch (error) {
            console.error('Error en login:', error);
            mensajeError.textContent = 'Error de conexión con el servidor.';
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Ingresar';
        }
    });
});

