let productos = [];
let productosOriginales = [];
let currentPage = 1;
const productosPorPagina = 10;
let sortColumn = 'id';
let sortOrder = 'asc';

async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        productosOriginales = await response.json();
        productos = [...productosOriginales];
        mostrarProductos();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los productos', 'danger');
    }
}

function mostrarProductos() {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const inicio = (currentPage - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>$${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${producto.talla}</td>
            <td>${producto.color}</td>
            <td>${producto.stock}</td>
            <td><img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 50px; max-height: 50px;"></td>
            <td class="text-end">
                <button class="btn btn-sm btn-info ver-mas" data-id="${producto.id}">Ver más</button>
                <button class="btn btn-sm btn-warning editar" data-id="${producto.id}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar" data-id="${producto.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarPaginacion() {
    const paginacion = document.getElementById('productosPagination');
    if (!paginacion) return;

    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    paginacion.innerHTML = '';

    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
    paginacion.appendChild(liAnterior);

    const liActual = document.createElement('li');
    liActual.className = 'page-item active';
    liActual.innerHTML = `<span class="page-link">${currentPage}</span>`;
    paginacion.appendChild(liActual);

    const liSiguiente = document.createElement('li');
    liSiguiente.className = `page-item ${currentPage === totalPaginas ? 'disabled' : ''}`;
    liSiguiente.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>`;
    paginacion.appendChild(liSiguiente);

    const liInfo = document.createElement('li');
    liInfo.className = 'page-item disabled';
    liInfo.innerHTML = `<span class="page-link">${currentPage}/${totalPaginas}</span>`;
    paginacion.appendChild(liInfo);
}

function mostrarAlerta(mensaje, tipo) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (!alertPlaceholder) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${tipo} alert-dismissible" role="alert">`,
        `   ${mensaje}`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstElementChild);
        alert.close();
    }, 3000);
}

function configurarEventListeners() {
    const btnNuevoProducto = document.querySelector('[data-bs-target="#nuevoProductoModal"]');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', prepararModalNuevoProducto);
    }

    const btnGuardarNuevoProducto = document.getElementById('guardarProductoBtn');
    if (btnGuardarNuevoProducto) {
        btnGuardarNuevoProducto.addEventListener('click', guardarNuevoProducto);
    }

    const productosTableBody = document.getElementById('productosTableBody');
    if (productosTableBody) {
        productosTableBody.addEventListener('click', function(e) {
            const productoId = e.target.closest('button').getAttribute('data-id');
            if (e.target.closest('.editar')) {
                abrirModalEditarProducto(productoId);
            } else if (e.target.closest('.eliminar')) {
                abrirModalConfirmarEliminar(productoId);
            } else if (e.target.closest('.ver-mas')) {
                verMasProducto(productoId);
            }
        });
    }

    const btnGuardarProductoEditado = document.getElementById('guardarProductoEditadoBtn');
    if (btnGuardarProductoEditado) {
        btnGuardarProductoEditado.addEventListener('click', guardarCambiosProducto);
    }

    const editProductoImagen = document.getElementById('editProductoImagen');
    if (editProductoImagen) {
        editProductoImagen.addEventListener('change', function() {
            mostrarVistaPrevia(this, 'editProductoImagenPreview');
        });
    }

    const imagenProducto = document.getElementById('imagenProducto');
    if (imagenProducto) {
        imagenProducto.addEventListener('change', function() {
            mostrarVistaPrevia(this, 'nuevoProductoImagenPreview');
        });
    }

    const btnConfirmarEliminar = document.getElementById('confirmarEliminarProductoBtn');
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', confirmarEliminarProducto);
    }

    // Agregar event listeners para ordenar
    const encabezadosTabla = document.querySelectorAll('#productosTable th[data-sort]');
    encabezadosTabla.forEach(th => {
        th.addEventListener('click', () => {
            const columna = th.getAttribute('data-sort');
            ordenarProductos(columna);
            
        });
    });

    const searchButton = document.getElementById('searchButtonProductos');
    if (searchButton) {
        searchButton.addEventListener('click', realizarBusqueda);
    }

    const searchInput = document.getElementById('searchInputProductos');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                realizarBusqueda();
            }
        });
    }

    const filtrarColorBtn = document.getElementById('filtrarColorBtn');
    if (filtrarColorBtn) {
        filtrarColorBtn.addEventListener('click', filtrarPorColor);
    }

    const filtrarColorInput = document.getElementById('filtroColor');
    if (filtrarColorInput) {
        filtrarColorInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                filtrarPorColor()
            }
        })
    }
}

function prepararModalNuevoProducto() {
    document.getElementById('nuevoProductoForm').reset();
    document.getElementById('nuevoProductoImagenPreview').style.display = 'none';
}

async function guardarNuevoProducto() {
    const form = document.getElementById('nuevoProductoForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar el producto');
        }

        const nuevoProducto = await response.json();
        productos.push(nuevoProducto);
        productosOriginales.push(nuevoProducto);

        mostrarAlerta('Producto agregado con éxito', 'success');
        cerrarModal('nuevoProductoModal');
        mostrarProductos();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message, 'danger');
    }
}

function cerrarModal(modalId) {
    const modalElement = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

async function abrirModalEditarProducto(productoId) {
    try {
        const response = await fetch(`/api/productos/${productoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos del producto');
        }
        const producto = await response.json();
        
        document.getElementById('editProductoId').value = producto.id;
        document.getElementById('editProductoNombre').value = producto.nombre;
        document.getElementById('editProductoPrecio').value = producto.precio;
        document.getElementById('editProductoTalla').value = producto.talla;
        document.getElementById('editProductoColor').value = producto.color;
        document.getElementById('editProductoStock').value = producto.stock;
        document.getElementById('editProductoDescripcion').value = producto.descripcion;
        
        // Resetear el campo de imagen
        document.getElementById('editProductoImagen').value = '';
        
        const imagenPreview = document.getElementById('editProductoImagenPreview');
        if (producto.imagen) {
            imagenPreview.src = producto.imagen;
            imagenPreview.style.display = 'block';
        } else {
            imagenPreview.style.display = 'none';
        }

        const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los datos del producto', 'danger');
    }
}

async function guardarCambiosProducto() {
    const form = document.getElementById('editarProductoForm');
    const formData = new FormData(form);
    const productoId = formData.get('id');

    // Verificar si se ha seleccionado una nueva imagen
    const imagenInput = document.getElementById('editProductoImagen');
    if (imagenInput.files.length === 0) {
        // Si no se seleccionó una nueva imagen, eliminar el campo de imagen del FormData
        formData.delete('imagen');
    }

    try {
        const response = await fetch(`/api/productos/${productoId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el producto');
        }

        const productoActualizado = await response.json();
        
        const index = productos.findIndex(p => p.id === productoActualizado.id);
        if (index !== -1) {
            productos[index] = productoActualizado;
            productosOriginales[index] = productoActualizado;
        }

        mostrarAlerta('Producto actualizado con éxito', 'success');
        cerrarModal('editarProductoModal');
        mostrarProductos();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al actualizar el producto', 'danger');
    }
}

function mostrarVistaPrevia(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function abrirModalConfirmarEliminar(productoId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarProductoModal'));
    modal.show();
    document.getElementById('confirmarEliminarProductoBtn').setAttribute('data-id', productoId);
}

async function confirmarEliminarProducto() {
    const productoId = this.getAttribute('data-id');
    try {
        const response = await fetch(`/api/productos/${productoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }

        productos = productos.filter(p => p.id !== productoId);
        productosOriginales = productosOriginales.filter(p => p.id !== productoId);

        mostrarAlerta('Producto eliminado con éxito', 'success');
        mostrarProductos();
        actualizarPaginacion();
        cerrarModal('confirmarEliminarProductoModal');
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar el producto', 'danger');
    }
}

async function verMasProducto(productoId) {
    try {
        const response = await fetch(`/api/productos/${productoId}`);
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del producto');
        }
        const producto = await response.json();
        const modalBody = document.getElementById('verMasProductoModalBody');
        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${producto.id}</p>
            <p><strong>Nombre:</strong> ${producto.nombre}</p>
            <p><strong>Precio:</strong> $${parseFloat(producto.precio).toFixed(2)}</p>
            <p><strong>Talla:</strong> ${producto.talla}</p>
            <p><strong>Color:</strong> ${producto.color}</p>
            <p><strong>Stock:</strong> ${producto.stock}</p>
            <p><strong>Descripción:</strong> ${producto.descripcion || 'No especificada'}</p>
            <p><strong>Imagen:</strong></p>
            <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 100%; max-height: 200px;">
        `;
        const modal = new bootstrap.Modal(document.getElementById('verMasProductoModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los detalles del producto', 'danger');
    }
}

function ordenarProductos(columna) {
    if (columna === sortColumn) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columna;
        sortOrder = 'asc';
    }

    productos.sort((a, b) => {
        let valorA = a[columna];
        let valorB = b[columna];

        // Convertir a número si la columna es 'precio' o 'stock'
        if (columna === 'precio' || columna === 'stock') {
            valorA = parseFloat(valorA);
            valorB = parseFloat(valorB);
        }

        if (valorA < valorB) return sortOrder === 'asc' ? -1 : 1;
        if (valorA > valorB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    mostrarProductos();
    actualizarPaginacion();
}

function realizarBusqueda() {
    const query = document.getElementById('searchInputProductos').value.toLowerCase();
    productos = productosOriginales.filter(producto => 
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
    );
    currentPage = 1;
    mostrarProductos();
    actualizarPaginacion();
}

function filtrarPorColor() {
    const color = document.getElementById('filtroColor').value.toLowerCase();
    productos = productosOriginales.filter(producto => 
        producto.color.toLowerCase().includes(color)
    );
    currentPage = 1;
    mostrarProductos();
    actualizarPaginacion();
}

export function activarProductos() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarProductos);
    } else {
        inicializarProductos();
    }
}

function inicializarProductos() {
    cargarProductos();
    configurarEventListeners();
}