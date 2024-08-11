// Función para verificar si el usuario está autenticado
export function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        // Actualizar la interfaz para un usuario autenticado
        const loginBtn = document.getElementById('loginBtn');
        const userDropdown = document.getElementById('userDropdown');
        const navbarDropdown = document.getElementById('navbarDropdown');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        if (navbarDropdown) navbarDropdown.textContent = usuario.nombre;
        
        // Si el usuario es admin, mostrar el enlace al panel de administración
        if (usuario.rol === 'admin') {
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = 'block';
            }
        }
    } else {
        // Actualizar la interfaz para un usuario no autenticado
        const loginBtn = document.getElementById('loginBtn');
        const userDropdown = document.getElementById('userDropdown');
        const adminLink = document.getElementById('adminLink');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        
        // Si estamos en el panel de administración, redirigir a la página de inicio
        if (window.location.pathname === '/panel-admin') {
            window.location.href = '/';
        }
    }
}

// Función para cerrar sesión
export function cerrarSesion() {
    localStorage.removeItem('usuario');
    verificarSesion();
    // Redirigir a la página de inicio o recargar la página actual
    window.location.href = '/';
}

// Estas funciones se llamarían desde tu main.js o donde manejes la lógica principal de tu aplicación