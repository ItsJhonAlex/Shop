import { verificarSesion, cerrarSesion } from '../auth.js';
import { activarClientes } from './clientes.js';

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    // Agregar evento de clic al botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }

    // Verificar si el usuario es administrador
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.rol !== 'admin') {
        // Si no es administrador, redirigir a la página de inicio
        window.location.href = '/';
    }

    // Activar la gestión de clientes
    activarClientes();

    // Aquí puedes agregar más lógica específica del panel de administración
});