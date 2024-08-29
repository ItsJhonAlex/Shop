import { activarClientes } from './admin/clientes.js';
import { activarProductos } from './admin/productos.js';
import { activarPedidos } from './admin/pedidos.js';

document.addEventListener('DOMContentLoaded', () => {
    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const cerrarSesionBtn = document.getElementById('cerrarSesion');

    // Añadir esta línea para obtener la sección actual del localStorage
    let seccionActual = localStorage.getItem('seccionActual') || 'clientes';

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            cargarSeccion(section);
        });
    });

    function cargarSeccion(section) {
        localStorage.setItem('seccionActual', section);
        
        fetch(`admin/${section}`)
            .then(response => response.text())
            .then(html => {
                contenidoPrincipal.innerHTML = html;
                switch(section) {
                    case 'clientes':
                        return activarClientes();
                    case 'productos':
                        return activarProductos();
                    case 'pedidos':
                        return activarPedidos();
                    default:
                        return Promise.resolve();
                }
            })
            .then(() => {
                console.log(`Sección ${section} cargada y activada`);
            })
            .catch(error => console.error('Error al cargar la sección:', error));
    }

    // Función para cerrar sesión
    function cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('seccionActual'); // Eliminar la sección actual al cerrar sesión
            alert('Has cerrado sesión exitosamente');
            window.location.href = '/';
        }
    }

    // Agregar evento al botón de cerrar sesión
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', cerrarSesion);
    }

    // Cargar la sección guardada o la de clientes por defecto
    cargarSeccion(seccionActual);
});