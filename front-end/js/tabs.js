import { obtenerServiciosPendientes} from './servicios.js';
import{cargarVehiculosEnSelect} from './vehiculos.js';
import { cargarListaMecanicos } from './registrar-mecanico.js';
/**
 * Función auxiliar para cambiar a una pestaña específica.
 * @param {string} targetId El ID del contenido de la pestaña ('tab-registro', 'tab-servicios', etc.)
 */
export function cambiarPestanaA(targetId) {
    // 1. Desactivar todos los botones y paneles
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // 2. Activar el panel (contenido)
    const targetPane = document.getElementById(targetId);
    if (targetPane) {
        targetPane.classList.add('active');
        // 3. Activar el botón correspondiente
        const targetButton = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
}


export function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;

            // Llama a la función de utilidad para cambiar la vista
            cambiarPestanaA(targetId);
            
            // Lógica extra: Si activamos el listado, forzar la recarga de datos
            if (targetId === 'tab-listado') {
                obtenerServiciosPendientes();
            }
            
            // Lógica extra: Si activamos la sección de servicio, forzar la carga de autos
            if (targetId === 'tab-servicios') {
                cargarVehiculosEnSelect(); 
            }
            if (targetId === 'tab-mecanicos') {
                cargarListaMecanicos(); 
            }
        });
    });
}