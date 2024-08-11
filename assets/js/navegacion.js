import { activarClientes } from './admin/clientes.js';
import { activarProductos } from './admin/productos.js';
import { activarPedidos } from './admin/pedidos.js';

document.addEventListener('DOMContentLoaded', () => {
    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const cerrarSesionBtn = document.getElementById('cerrarSesion');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            cargarSeccion(section);
        });
    });

    function cargarSeccion(section) {
        fetch(`admin/${section}`)
            .then(response => response.text())
            .then(html => {
                contenidoPrincipal.innerHTML = html;
                switch(section) {
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
            })
            .catch(error => console.error('Error al cargar la sección:', error));
    }

    // Función para cerrar sesión
    function cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Aquí puedes agregar la lógica para limpiar la sesión
            // Por ejemplo, eliminar tokens de autenticación del localStorage
            localStorage.removeItem('authToken');
            
            // Mostrar un mensaje de éxito
            alert('Has cerrado sesión exitosamente');
            
            // Redirigir a la página principal
            window.location.href = '/';
        }
    }

    // Agregar evento al botón de cerrar sesión
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', cerrarSesion);
    }

    // Cargar la sección de clientes por defecto
    cargarSeccion('clientes');
});