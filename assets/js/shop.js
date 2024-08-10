export function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('shop')) || [];
}