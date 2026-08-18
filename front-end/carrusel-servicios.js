// Paso 1: Definir los textos para cada servicio
const serviceData = {
    'diagnostico': "Tenemos las herramientas y maquinarias necesarias para realizar un diagnóstico completo a su vehículo.",
    'motor': "Si su motor está enfermo o cansado, tenemos el equipo para revisar, diagnosticar y solucionar de manera eficiente cualquier problema que pueda tener.",
    'aceite': "El cambio de aceite y filtro de motor es parte de la mantención del motor de su automóvil; es una de las maneras más sencillas y económicas de ayudar a proteger la vida del motor de su vehículo.",
    // Agrega el texto para el resto de tus servicios aquí:
    'llantas': "Revisión, rotación y balanceo de llantas para garantizar la seguridad y extender la vida útil de sus neumáticos.",
    'transmision': "Mantenimiento y reparación de la transmisión para asegurar cambios de marcha suaves y eficientes.",
    'bateria': "La batería es un elemento fundamental en el sistema de encendido de su vehículo, ya que es ella la que aporta la energía necesaria para que el motor arranque y ponga en marcha su vehículo. Se debe verificar su vida útil periódicamente.",
};

// Paso 2: Obtener referencias a los elementos del DOM
const serviceCards = document.querySelectorAll('.service-card');
const serviceDescriptionElement = document.getElementById('service-description');
const serviceTextBox = document.getElementById('service-text-box');

// Paso 3: Añadir el Event Listener a cada tarjeta de servicio
serviceCards.forEach(card => {
    card.addEventListener('click', function() {
        // Obtener la clave del servicio (ej: 'diagnostico') del atributo data-service
        const serviceKey = this.getAttribute('data-service');
        
        // Obtener el nuevo texto
        const newText = serviceData[serviceKey];
        
        // Paso 4: Actualizar el contenido de la caja de texto
        if (newText) {
            // Aplicar un efecto de transición simple (opcional, pero mejora la experiencia)
            serviceTextBox.style.opacity = 0; 
            
            setTimeout(() => {
                serviceDescriptionElement.textContent = newText;
                serviceTextBox.style.opacity = 1; 
            }, 150); // Pequeño retraso para el efecto de fade
        }

        // Opcional: Resaltar la tarjeta activa (requiere CSS)
        serviceCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
    });
});