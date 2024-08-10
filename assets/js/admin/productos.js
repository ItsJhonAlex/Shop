let productosOriginales = [];
let productos = [];
let sortColumn = 'id';
let sortOrder = 'asc';
let currentPage = 1;
const itemsPerPage = 10;

let productoAEliminar = null;

function cargarProductos() {
    // Aquí deberías hacer una llamada a tu API o base de datos
    // Por ahora, usaremos datos de ejemplo
    productosOriginales = [
        { id: 'PROD001', nombre: 'Camisa Azul', precio: 19.99, talla: 'M', color: 'Azul', stock: 100, imagen: '../../assets/img/camisa-azul.jpg', descripcion: 'Camisa de algodón color azul' },
        { id: 'PROD002', nombre: 'Camisa Roja', precio: 39.99, talla: 'L', color: 'Rojo', stock: 50, imagen: '../../assets/img/camisa-roja.jpg', descripcion: 'Camisa de lino color rojo' },
        { id: 'PROD003', nombre: 'Camisa Verde', precio: 59.99, talla: '42', color: 'Verde', stock: 30, imagen: '../../assets/img/camisa-verde.jpg', descripcion: 'Camisa de seda color verde' },
    ];
    productos = [...productosOriginales];
    mostrarProductos();
    actualizarPaginacion();
}

function mostrarProductos() {
    const tbody = document.getElementById('productosTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productosPaginados = productos.slice(startIndex, endIndex);

    productosPaginados.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ID">${producto.id}</td>
            <td data-label="Nombre">${producto.nombre}</td>
            <td data-label="Precio">$${producto.precio.toFixed(2)}</td>
            <td data-label="Talla">${producto.talla}</td>
            <td data-label="Color">${producto.color}</td>
            <td data-label="Stock">${producto.stock}</td>
            <td data-label="Imagen"><img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px;"></td>
            <td data-label="Acciones">
                <button class="btn btn-sm btn-info ver-mas-producto" data-id="${producto.id}">Ver más</button>
                <button class="btn btn-sm btn-primary editar-producto" data-id="${producto.id}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar-producto" data-id="${producto.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones
    document.querySelectorAll('.ver-mas-producto').forEach(button => {
        button.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            console.log('Ver más clicked para producto:', productoId); // Agregar este log
            mostrarDetallesProducto(productoId);
        });
    });

    document.querySelectorAll('.editar-producto').forEach(button => {
        button.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            abrirModalEditarProducto(productoId);
        });
    });

    document.querySelectorAll('.eliminar-producto').forEach(button => {
        button.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            mostrarConfirmacionEliminarProducto(productoId);
        });
    });
}

function mostrarDetallesProducto(productoId) {
    console.log('Mostrando detalles para producto:', productoId); // Agregar este log
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        const modalBody = document.getElementById('verMasProductoBody');
        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${producto.id}</p>
            <p><strong>Nombre:</strong> ${producto.nombre}</p>
            <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
            <p><strong>Talla:</strong> ${producto.talla}</p>
            <p><strong>Color:</strong> ${producto.color}</p>
            <p><strong>Stock:</strong> ${producto.stock}</p>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
            <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 100%;">
        `;
        const modal = new bootstrap.Modal(document.getElementById('verMasProductoModal'));
        modal.show();
    } else {
        console.error('Producto no encontrado');
    }
}

function mostrarConfirmacionEliminarProducto(productoId) {
    productoAEliminar = productoId;
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarProductoModal'));
    modal.show();
}

function eliminarProducto() {
    if (productoAEliminar) {
        productos = productos.filter(producto => producto.id !== productoAEliminar);
        productosOriginales = productosOriginales.filter(producto => producto.id !== productoAEliminar);
        mostrarProductos();
        actualizarPaginacion();
        productoAEliminar = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarProductoModal'));
        modal.hide();
        mostrarAlerta('Producto eliminado con éxito', 'success');
    }
}

function abrirModalEditarProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        document.getElementById('editProductoId').value = producto.id;
        document.getElementById('editProductoNombre').value = producto.nombre;
        document.getElementById('editProductoPrecio').value = producto.precio;
        document.getElementById('editProductoTalla').value = producto.talla;
        document.getElementById('editProductoColor').value = producto.color;
        document.getElementById('editProductoStock').value = producto.stock;
        document.getElementById('editProductoDescripcion').value = producto.descripcion;

        const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
        modal.show();
    }
}

function validarFormularioProducto() {
    const nombre = document.getElementById('editProductoNombre').value.trim();
    const precio = document.getElementById('editProductoPrecio').value.trim();
    const talla = document.getElementById('editProductoTalla').value.trim();
    const color = document.getElementById('editProductoColor').value.trim();
    const stock = document.getElementById('editProductoStock').value.trim();
    const descripcion = document.getElementById('editProductoDescripcion').value.trim();

    if (nombre === '') {
        mostrarError('editProductoNombre', 'El nombre es obligatorio');
        return false;
    }

    if (precio === '' || isNaN(precio) || parseFloat(precio) <= 0) {
        mostrarError('editProductoPrecio', 'El precio debe ser un número positivo');
        return false;
    }

    if (talla === '') {
        mostrarError('editProductoTalla', 'La talla es obligatoria');
        return false;
    }

    if (color === '') {
        mostrarError('editProductoColor', 'El color es obligatorio');
        return false;
    }

    if (stock === '' || isNaN(stock) || parseInt(stock) < 0) {
        mostrarError('editProductoStock', 'El stock debe ser un número no negativo');
        return false;
    }

    if (descripcion === '') {
        mostrarError('editProductoDescripcion', 'La descripción es obligatoria');
        return false;
    }

    return true;
}

function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    campo.classList.add('is-invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = mensaje;
    campo.parentNode.appendChild(errorDiv);
}

function limpiarErrores() {
    const campos = document.querySelectorAll('.is-invalid');
    campos.forEach(campo => {
        campo.classList.remove('is-invalid');
        const errorDiv = campo.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    });
}

function guardarCambiosProducto() {
    limpiarErrores();
    if (validarFormularioProducto()) {
        const productoId = document.getElementById('editProductoId').value;
        const productoIndex = productos.findIndex(p => p.id === productoId);

        if (productoIndex !== -1) {
            productos[productoIndex] = {
                id: productoId,
                nombre: document.getElementById('editProductoNombre').value,
                precio: parseFloat(document.getElementById('editProductoPrecio').value),
                talla: document.getElementById('editProductoTalla').value,
                color: document.getElementById('editProductoColor').value,
                stock: parseInt(document.getElementById('editProductoStock').value),
                descripcion: document.getElementById('editProductoDescripcion').value,
                imagen: productos[productoIndex].imagen // Mantener la imagen existente
            };

            mostrarProductos();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProductoModal'));
            modal.hide();
            mostrarAlerta('Producto actualizado con éxito', 'success');
        }
    }
}

function actualizarPaginacion() {
    const totalPages = Math.ceil(productos.length / itemsPerPage);
    const paginationElement = document.getElementById('productosPagination');
    paginationElement.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botón "Anterior"
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
    ul.appendChild(liPrev);

    // Página actual
    const liCurrent = document.createElement('li');
    liCurrent.className = 'page-item active';
    liCurrent.innerHTML = `<span class="page-link">${currentPage}</span>`;
    ul.appendChild(liCurrent);

    // Botón "Siguiente"
    const liNext = document.createElement('li');
    liNext.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    liNext.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>`;
    ul.appendChild(liNext);

    // Información de página actual / total de páginas
    const liInfo = document.createElement('li');
    liInfo.className = 'page-item disabled';
    liInfo.innerHTML = `<span class="page-link">${currentPage}/${totalPages}</span>`;
    ul.appendChild(liInfo);

    paginationElement.appendChild(ul);
}

function cambiarPagina(newPage) {
    const totalPages = Math.ceil(productos.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        mostrarProductos();
        actualizarPaginacion();
    }
}

function realizarBusqueda() {
    const query = document.getElementById('searchInputProductos').value;
    if (query.trim() === '') {
        productos = [...productosOriginales];
    } else {
        productos = productosOriginales.filter(producto => 
            producto.id.toLowerCase().includes(query.toLowerCase()) ||
            producto.nombre.toLowerCase().includes(query.toLowerCase())
        );
    }
    currentPage = 1;
    mostrarProductos();
    actualizarPaginacion();
}

function ordenarProductos(columna) {
    if (columna === sortColumn) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columna;
        sortOrder = 'asc';
    }

    productos.sort((a, b) => {
        if (a[columna] < b[columna]) return sortOrder === 'asc' ? -1 : 1;
        if (a[columna] > b[columna]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    mostrarProductos();
}

function filtrarPorPrecio() {
    const minPrecio = parseFloat(document.getElementById('minPrecio').value) || 0;
    const maxPrecio = parseFloat(document.getElementById('maxPrecio').value) || Infinity;

    productos = productosOriginales.filter(producto => 
        producto.precio >= minPrecio && producto.precio <= maxPrecio
    );

    currentPage = 1;
    mostrarProductos();
    actualizarPaginacion();
}

function mostrarAlerta(mensaje, tipo) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${tipo} alert-dismissible" role="alert">`,
        `   <div>${mensaje}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);

    // Eliminar la alerta después de 3 segundos
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstElementChild);
        alert.close();
    }, 3000);
}

function configurarEventListeners() {
    document.getElementById('searchButtonProductos').addEventListener('click', realizarBusqueda);
    document.getElementById('searchInputProductos').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            realizarBusqueda();
        }
    });

    document.getElementById('filtrarPrecioBtn').addEventListener('click', filtrarPorPrecio);

    document.getElementById('confirmarEliminarProductoBtn').addEventListener('click', eliminarProducto);

    document.getElementById('guardarProductoEditadoBtn').addEventListener('click', guardarCambiosProducto);

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            ordenarProductos(this.getAttribute('data-sort'));
        });
    });

    document.getElementById('productosPagination').addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.hasAttribute('data-page')) {
            e.preventDefault();
            const newPage = parseInt(e.target.getAttribute('data-page'));
            cambiarPagina(newPage);
        }
    });

    document.getElementById('guardarProductoBtn').addEventListener('click', guardarNuevoProducto);
}

function guardarNuevoProducto() {
    const nombre = document.getElementById('nombreProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const talla = document.getElementById('tallaProducto').value;
    const color = document.getElementById('colorProducto').value;
    const stock = parseInt(document.getElementById('stockProducto').value);
    const imagen = document.getElementById('imagenProducto').files[0];
    const descripcion = document.getElementById('descripcionProducto').value;

    const nuevoProducto = {
        id: `PROD${productos.length + 1}`.padStart(7, '0'),
        nombre,
        precio,
        talla,
        color,
        stock,
        imagen: URL.createObjectURL(imagen),
        descripcion
    };

    productos.push(nuevoProducto);
    productosOriginales.push(nuevoProducto);

    mostrarProductos();
    actualizarPaginacion();

    const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoProductoModal'));
    modal.hide();

    mostrarAlerta('Producto agregado con éxito', 'success');
}

export function activarProductos() {
    cargarProductos();
    configurarEventListeners();
}