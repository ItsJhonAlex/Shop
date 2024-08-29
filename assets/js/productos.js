import { agregarAlCarrito, actualizarContadorCarrito } from './shop.js';

// Array para almacenar los productos
let productos = [];
let productosOriginales = [];

// Función para cargar los productos desde el servidor
export async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        productosOriginales = await response.json();
        productos = [...productosOriginales];
        mostrarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para mostrar los productos en el catálogo
function mostrarProductos() {
    console.log('Mostrando productos:', productos); // Mantén este log para depuración
    const contenedorProductos = document.getElementById('productosContainer');
    if (!contenedorProductos) {
        console.error('El contenedor de productos no se encontró en el DOM');
        return;
    }
    contenedorProductos.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos productos

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
                    <p class="card-text"><strong>Precio: $${Number(producto.precio).toFixed(2)}</strong></p>
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
            actualizarContadorCarrito();
        });
    });
}

// Llamar a cargarProductos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductos);