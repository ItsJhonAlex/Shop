import { agregarAlCarrito } from './shop.js';

// Array para almacenar los productos
let productos = [];

// Función para cargar los productos desde el servidor o una fuente de datos
export async function cargarProductos() {
    try {
        // Aquí deberías hacer una llamada a tu API o base de datos
        // Por ahora, usaremos datos de ejemplo
        productos = [
            { id: 1, nombre: 'Camisa Azul', precio: 29.99, imagen: '/assets/img/camisa-azul.jpg', descripcion: 'Camisa de algodón', talla: 'M', color: 'Azul' },
            { id: 2, nombre: 'Camisa Roja', precio: 39.99, imagen: '/assets/img/camisa-roja.jpg', descripcion: 'Camisa de lino', talla: 'L', color: 'Rojo' },
            { id: 3, nombre: 'Camisa Verde', precio: 59.99, imagen: '/assets/img/camisa-verde.jpg', descripcion: 'Camisa de seda', talla: 'S', color: 'Verde' },
            // Agrega más productos aquí
        ];
        mostrarProductos();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función para mostrar los productos en el catálogo
function mostrarProductos() {
    console.log('Mostrando productos:', productos); // Mantén este log
    const contenedorProductos = document.getElementById('productosContainer');
    if (!contenedorProductos) {
        console.error('El contenedor de productos no se encontró en el DOM');
        return;
    }
    contenedorProductos.innerHTML = '';

    productos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.className = 'col-md-4 mb-4';
        productoElement.innerHTML = `
            <div class="card">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text"><strong>Talla:</strong> ${producto.talla}</p>
                    <p class="card-text"><strong>Color:</strong> ${producto.color}</p>
                    <p class="card-text"><strong>Precio: $${producto.precio.toFixed(2)}</strong></p>
                    <button class="btn btn-primary agregar-al-carrito" data-id="${producto.id}">Agregar al carrito</button>
                </div>
            </div>
        `;
        contenedorProductos.appendChild(productoElement);
    });

    // Agregar event listeners a los botones "Agregar al carrito"
    document.querySelectorAll('.agregar-al-carrito').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const producto = productos.find(p => p.id === id);
            agregarAlCarrito(producto);
        });
    });
}

// Llamar a cargarProductos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductos);