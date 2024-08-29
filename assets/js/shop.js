import { verificarSesion } from './auth.js';

export function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

// Función para guardar el carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para agregar un producto al carrito
export function agregarAlCarrito(producto) {
    let carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad += 1; // Incrementar cantidad si ya existe
    } else {
        carrito.push({ ...producto, cantidad: 1 }); // Agregar nuevo producto
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito(); // Actualizar el contador del carrito
    mostrarItemsCarrito(); // Mostrar los items en el carrito después de agregar
}

// Función para actualizar el contador del carrito en la barra de navegación
export function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
    const carritoCount = document.getElementById('carritoCount');
    if (carritoCount) {
        carritoCount.textContent = cantidadTotal;
    }
}

// Función para mostrar los items del carrito en la página de carrito
function mostrarItemsCarrito() {
    const tbody = document.getElementById('carritoTableBody');
    if (!tbody) return; // Si no existe el elemento, salimos de la función

    const carrito = obtenerCarrito();
    tbody.innerHTML = ''; // Limpiar el contenido del tbody

    carrito.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${Number(item.precio).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-secondary restar-cantidad" data-id="${item.id}">-</button>
                <span class="mx-2">${item.cantidad}</span>
                <button class="btn btn-sm btn-secondary sumar-cantidad" data-id="${item.id}">+</button>
            </td>
            <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger eliminar-item" data-id="${item.id}">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });

    actualizarTotal(); // Actualizar el total del carrito
}

// Función para actualizar el total del carrito
function actualizarTotal() {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.getElementById('totalCarrito').textContent = `$${total.toFixed(2)}`;
}

// Función para manejar los cambios en la cantidad de productos
function manejarCambiosCantidad(e) {
    if (e.target.classList.contains('restar-cantidad') || e.target.classList.contains('sumar-cantidad')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        let carrito = obtenerCarrito();
        const itemIndex = carrito.findIndex(i => i.id === id);

        if (itemIndex === -1) {
            console.error('Producto no encontrado en el carrito');
            return;
        }

        if (e.target.classList.contains('restar-cantidad')) {
            carrito[itemIndex].cantidad = Math.max(0, carrito[itemIndex].cantidad - 1);
        } else {
            carrito[itemIndex].cantidad += 1;
        }

        if (carrito[itemIndex].cantidad === 0) {
            carrito.splice(itemIndex, 1);
        }

        guardarCarrito(carrito);
        mostrarItemsCarrito(); // Mostrar los items actualizados en el carrito
        actualizarContadorCarrito();
    }
}

// Función para eliminar un item del carrito
function eliminarItemCarrito(e) {
    if (e.target.classList.contains('eliminar-item')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        let carrito = obtenerCarrito();
        carrito = carrito.filter(item => item.id !== id);
        guardarCarrito(carrito);
        mostrarItemsCarrito(); // Mostrar los items actualizados en el carrito
        actualizarContadorCarrito();
    }
}

async function finalizarCompra(e) {
    e.preventDefault();
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Debes iniciar sesión para finalizar la compra');
        window.location.href = '/login';
        return;
    }

    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const email = document.getElementById('email').value;
    const metodoEntrega = document.querySelector('input[name="metodoEntrega"]:checked').value;

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    try {
        // Crear el pedido
        const pedidoResponse = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario_id: usuario.id,
                total: total,
                direccion_envio: metodoEntrega === 'domicilio' ? direccion : 'Recoger en tienda',
            }),
        });

        if (!pedidoResponse.ok) {
            throw new Error('Error al crear el pedido');
        }

        const pedido = await pedidoResponse.json();

        // Crear los detalles del pedido
        for (const item of carrito) {
            await fetch('/api/detalles-pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pedido_id: pedido.id,
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                }),
            });
        }

        // Limpiar el carrito
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        mostrarItemsCarrito();

        // Mostrar el modal de agradecimiento
        const modal = new bootstrap.Modal(document.getElementById('agradecimientoModal'));
        modal.show();

        // Redirigir a la página principal después de cerrar el modal
        document.getElementById('agradecimientoModal').addEventListener('hidden.bs.modal', function () {
            window.location.href = '/';
        });
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        alert('Hubo un error al procesar tu compra. Por favor, intenta de nuevo.');
    }
}

// Inicializar la página de carrito
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    actualizarContadorCarrito();

    const carritoTableBody = document.getElementById('carritoTableBody');
    if (carritoTableBody) {
        mostrarItemsCarrito();
        carritoTableBody.addEventListener('click', manejarCambiosCantidad);
        carritoTableBody.addEventListener('click', eliminarItemCarrito);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', finalizarCompra);
    }
});