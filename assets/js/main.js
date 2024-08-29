import { cargarProductos } from './productos.js';
import { actualizarContadorCarrito } from './shop.js';
import { verificarSesion, cerrarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    actualizarContadorCarrito();
    verificarSesion();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }
});