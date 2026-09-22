// Contenedor global de toasts
function obtenerContenedorToast() {
  let contenedor = document.getElementById('toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    contenedor.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
      pointer-events: none;
    `;
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

export function notificar(mensaje, tipo = 'info') {
  const contenedor = obtenerContenedorToast();
  const toast = document.createElement('div');

  // Paleta de colores según el tipo
  let bg = '#0d6efd'; // Info (azul)
  let icono = 'ℹ️';
  if (tipo === 'exito' || mensaje.includes('✅') || mensaje.toLowerCase().includes('éxito')) {
    bg = '#198754'; // Éxito (verde)
    icono = '✅';
  } else if (tipo === 'error' || mensaje.includes('❌') || mensaje.toLowerCase().includes('error')) {
    bg = '#dc3545'; // Error (rojo)
    icono = '⚠️';
  }

  // Limpiar emojis repetidos si el mensaje ya los trae
  const textoLimpio = mensaje.replace(/^[✅❌⚠️ℹ️]\s*/, '');

  toast.style.cssText = `
    background: ${bg};
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    word-break: break-word;
  `;

  toast.innerHTML = `<span>${icono}</span><span>${textoLimpio}</span>`;
  contenedor.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Salida automática a los 3.5 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

export function modalConfirmar(mensaje) {
  return new Promise((resolve) => {
    const fondo = document.createElement('div');
    fondo.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;backdrop-filter:blur(2px);';

    fondo.innerHTML = `
      <div style="background:white;padding:24px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);max-width:400px;width:90%;font-family:system-ui,sans-serif;text-align:center;">
        <h4 style="margin:0 0 12px;color:#333;">Confirmación</h4>
        <p style="margin:0 0 20px;color:#555;font-size:0.95rem;line-height:1.4;">${mensaje}</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="btn-cancelar" style="padding:8px 18px;border:1px solid #ccc;background:#f8f9fa;border-radius:6px;cursor:pointer;font-weight:500;">Cancelar</button>
          <button id="btn-aceptar" style="padding:8px 18px;border:none;background:#2563eb;color:white;border-radius:6px;cursor:pointer;font-weight:500;">Aceptar</button>
        </div>
      </div>
    `;

    document.body.appendChild(fondo);

    fondo.querySelector('#btn-aceptar').onclick = () => { fondo.remove(); resolve(true); };
    fondo.querySelector('#btn-cancelar').onclick = () => { fondo.remove(); resolve(false); };
  });
}

// Modal personalizado para ingresar texto (reemplaza prompt)
export function modalPedirTexto(titulo, valorPorDefecto = '') {
  return new Promise((resolve) => {
    const fondo = document.createElement('div');
    fondo.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;backdrop-filter:blur(2px);';

    fondo.innerHTML = `
      <div style="background:white;padding:24px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);max-width:420px;width:90%;font-family:system-ui,sans-serif;">
        <h4 style="margin:0 0 12px;color:#1f2937;">${titulo}</h4>
        <input id="input-modal" type="text" value="${valorPorDefecto}" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;font-size:0.95rem;margin-bottom:20px;outline:none;" />
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button id="btn-cancelar" style="padding:8px 18px;border:1px solid #d1d5db;background:white;color:#4b5563;border-radius:6px;cursor:pointer;font-weight:600;">Cancelar</button>
          <button id="btn-aceptar" style="padding:8px 18px;border:none;background:var(--color-principal, #f5a623);color:#1f2937;border-radius:6px;cursor:pointer;font-weight:600;">Guardar</button>
        </div>
      </div>
    `;

    document.body.appendChild(fondo);
    const input = fondo.querySelector('#input-modal');
    input.focus();
    input.select();

    fondo.querySelector('#btn-aceptar').onclick = () => {
      const val = input.value;
      fondo.remove();
      resolve(val);
    };
    fondo.querySelector('#btn-cancelar').onclick = () => {
      fondo.remove();
      resolve(null);
    };
  });
}

export function mostrarModalCliente(datos) {
  const fondo = document.createElement('div');
  fondo.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10002;backdrop-filter:blur(2px);';

  fondo.innerHTML = `
    <div style="background:white;padding:24px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);max-width:400px;width:90%;font-family:system-ui,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:16px;">
        <h4 style="margin:0;color:#0f172a;font-size:1.1rem;display:flex;align-items:center;gap:8px;">
          <span>👤</span> Información del Cliente
        </h4>
        <button id="btn-cerrar-info" style="border:none;background:none;font-size:1.3rem;cursor:pointer;color:#64748b;line-height:1;">&times;</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;font-size:0.95rem;color:#334155;">
        <p style="margin:0;"><strong>Nombre:</strong> <span>${datos.Nombre || 'N/A'}</span></p>
        <p style="margin:0;"><strong>RUT:</strong> <span>${datos.Rut || datos.RUT || 'N/A'}</span></p>
        <p style="margin:0;"><strong>Teléfono:</strong> <span>${datos.Telefono || 'N/A'}</span></p>
        <p style="margin:0;"><strong>Correo:</strong> <span>${datos.Correo || 'N/A'}</span></p>
        <hr style="border:none;border-top:1px dashed #cbd5e1;margin:6px 0;" />
        <p style="margin:0;"><strong>Vehículo:</strong> <span>${datos.Marca || ''} ${datos.Modelo || ''}</span></p>
        <p style="margin:0;"><strong>Patente:</strong> <span style="font-family:monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;font-weight:bold;">${datos.Patente || 'N/A'}</span></p>
      </div>

      <div style="margin-top:20px;text-align:right;">
        <button id="btn-entendido" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(fondo);

  const cerrar = () => fondo.remove();
  fondo.querySelector('#btn-cerrar-info').onclick = cerrar;
  fondo.querySelector('#btn-entendido').onclick = cerrar;
  fondo.onclick = (e) => { if (e.target === fondo) cerrar(); };
}

// Reemplazo transparente de alert nativo
window.alert = function (mensaje) {
  notificar(String(mensaje));
};