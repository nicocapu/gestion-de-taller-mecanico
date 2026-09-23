document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.querySelector('form');
    const inputCorreo = document.querySelector('input[type="email"], input[name="correo"], #correo') || document.querySelectorAll('input')[0];
    const inputPassword = document.querySelector('input[type="password"], input[name="password"], #password') || document.querySelectorAll('input')[1];
    const btnLogin = document.querySelector('button[type="submit"]') || document.querySelector('.btn-ingresar') || document.querySelector('button');

    // Contenedor para mensajes de error si no existe en el HTML
    let mensajeError = document.getElementById('mensaje-error');
    if (!mensajeError && formLogin) {
        mensajeError = document.createElement('p');
        mensajeError.id = 'mensaje-error';
        mensajeError.style.color = '#dc2626';
        mensajeError.style.fontSize = '0.9rem';
        mensajeError.style.marginTop = '10px';
        mensajeError.style.textAlign = 'center';
        formLogin.appendChild(mensajeError);
    }

    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const correo = inputCorreo ? inputCorreo.value.trim() : '';
        const password = inputPassword ? inputPassword.value : '';

        if (!correo || !password) {
            mensajeError.textContent = 'Por favor complete todos los campos.';
            return;
        }

        if (btnLogin) {
            btnLogin.disabled = true;
            btnLogin.textContent = 'Ingresando...';
        }
        mensajeError.textContent = '';

        try {
            const response = await fetch("https://gestion-de-taller-mecanico-production.up.railway.app/signin", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            localStorage.setItem('rol', data.rol);
            window.location.href = './vista_taller_mecanico.html';
        } catch (error) {
            console.error('Error en login:', error);
            mensajeError.textContent = 'Error de conexión con el servidor.';
        } finally {
            if (btnLogin) {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Ingresar';
            }
        }
    });
});