import { cargarProductos } from './productos.js';
import { inicializarCarrito } from './shop.js';
import { verificarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    inicializarCarrito();
    verificarSesion();
});

function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const adminLink = document.getElementById('adminLink');

    if (usuario) {
        loginBtn.style.display = 'none';
        userDropdown.style.display = 'block';
        document.getElementById('navbarDropdown').textContent = usuario.nombre;

        if (usuario.esAdmin) {
            adminLink.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'block';
        userDropdown.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    verificarSesion();
    window.location.reload();
});