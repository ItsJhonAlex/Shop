import { cargarProductos } from './productos.js';
import { obtenerCarrito, agregarAlCarrito, actualizarContadorCarrito } from './shop.js';
import { verificarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    actualizarContadorCarrito();
    verificarSesion();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    verificarSesion();
    window.location.reload();
});