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

// Inicializar la página de carrito
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();

    const carritoTableBody = document.getElementById('carritoTableBody');
    if (carritoTableBody) {
        mostrarItemsCarrito(); // Mostrar los items en el carrito al cargar la página
        carritoTableBody.addEventListener('click', manejarCambiosCantidad);
        carritoTableBody.addEventListener('click', eliminarItemCarrito);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Aquí iría la lógica para procesar el pedido
            alert('¡Gracias por tu compra!');
            localStorage.removeItem('carrito');
            mostrarItemsCarrito(); // Limpiar el carrito después de la compra
            actualizarContadorCarrito();
        });
    }
});