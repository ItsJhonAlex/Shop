import { activarClientes } from './admin/clientes.js';
import { activarProductos } from './admin/productos.js';
import { activarPedidos } from './admin/pedidos.js';

document.addEventListener('DOMContentLoaded', function() {
    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    const enlaces = document.querySelectorAll('.nav-link[data-section]');
    const cerrarSesionBtn = document.getElementById('cerrarSesion');

    async function cargarSeccion(seccion) {
        try {
            const response = await fetch(`../views/admin/${seccion}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            contenidoPrincipal.innerHTML = html;
            
            // Aplicar la clase 'loaded' después de un breve retraso
            setTimeout(() => {
                contenidoPrincipal.classList.add('loaded');
            }, 50);

            // Cerrar el menú desplegable en dispositivos móviles después de seleccionar una opción
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }

            switch(seccion) {
                case 'clientes':
                    activarClientes();
                    break;
                case 'productos':
                    activarProductos();
                    break;
                case 'pedidos':
                    activarPedidos();
                    break;
            }
        } catch (error) {
            console.error('Error al cargar la sección:', error);
            contenidoPrincipal.innerHTML = '<p>Error al cargar la sección. Por favor, intente de nuevo.</p>';
        }
    }

    // Asegúrate de remover la clase 'loaded' antes de cargar una nueva sección
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();
            contenidoPrincipal.classList.remove('loaded');
            const seccion = this.getAttribute('data-section');
            cargarSeccion(seccion);
        });
    });

    cerrarSesionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        cerrarSesion();
    });

    function cerrarSesion() {
        // Aquí deberías implementar la lógica para cerrar la sesión
        // Por ejemplo, eliminar tokens de autenticación, limpiar el almacenamiento local, etc.
        
        // Ejemplo básico:
        if (confirm('¿Está seguro de que desea cerrar sesión?')) {
            // Eliminar token de sesión (si lo estás usando)
            localStorage.removeItem('token');
            
            // Redirigir a la página de inicio de sesión
            window.location.href = 'login.html';
        }
    }

    // Cargar la sección de clientes por defecto
    cargarSeccion('clientes');
});