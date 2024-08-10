// Función para verificar si el usuario está autenticado
export function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        // Mostrar el nombre del usuario en la barra de navegación
        document.getElementById('userName').textContent = `Hola ${usuario.nombre}`;
        // Mostrar el botón de logout
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        // Ocultar el botón de logout
        document.getElementById('logoutBtn').style.display = 'none';
    }
}
