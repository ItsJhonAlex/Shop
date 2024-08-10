let pedidosOriginales = [];
let pedidos = [];
let sortColumn = 'id';
let sortOrder = 'asc';
let currentPage = 1;
const itemsPerPage = 10; // Puedes ajustar este número según tus necesidades

let pedidoACancelar = null;

function cargarPedidos() {
    // Aquí deberías hacer una llamada a tu API o base de datos
    // Por ahora, usaremos datos de ejemplo
    pedidosOriginales = [
        { id: 'PED001', cliente: 'Juan Pérez', fecha: '2023-04-15', total: 129.99, estado: 'Pendiente', direccion: 'Calle 123, Ciudad' },
        { id: 'PED002', cliente: 'María García', fecha: '2023-04-14', total: 89.50, estado: 'Enviado', direccion: 'Avenida 456, Pueblo' },
        { id: 'PED003', cliente: 'Carlos López', fecha: '2023-04-13', total: 199.99, estado: 'Entregado', direccion: 'Plaza 789, Villa' },
    ];
    pedidos = [...pedidosOriginales]; // Copia todos los pedidos a la variable de trabajo
    mostrarPedidos();
    actualizarPaginacion();
}

function mostrarPedidos() {
    const tbody = document.getElementById('pedidosTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pedidosPaginados = pedidos.slice(startIndex, endIndex);

    pedidosPaginados.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ID">${pedido.id}</td>
            <td data-label="Cliente">${pedido.cliente}</td>
            <td data-label="Fecha">${pedido.fecha}</td>
            <td data-label="Total">$${pedido.total.toFixed(2)}</td>
            <td data-label="Estado"><span class="estado-badge estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span></td>
            <td data-label="Dirección">${pedido.direccion}</td>
            <td data-label="Acciones">
                <button class="btn btn-sm btn-primary editar-pedido" data-id="${pedido.id}">Editar</button>
                <button class="btn btn-sm btn-danger cancelar-pedido" data-id="${pedido.id}">Cancelar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones de editar
    document.querySelectorAll('.editar-pedido').forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.getAttribute('data-id');
            abrirModalEditarPedido(pedidoId);
        });
    });

    // Agregar event listeners a los botones de cancelar
    document.querySelectorAll('.cancelar-pedido').forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.getAttribute('data-id');
            mostrarConfirmacionCancelarPedido(pedidoId);
        });
    });
}

function mostrarConfirmacionCancelarPedido(pedidoId) {
    pedidoACancelar = pedidoId;
    const modal = new bootstrap.Modal(document.getElementById('confirmarCancelarPedidoModal'));
    modal.show();
}

function cancelarPedido() {
    if (pedidoACancelar) {
        const pedidoIndex = pedidos.findIndex(pedido => pedido.id === pedidoACancelar);
        if (pedidoIndex !== -1) {
            pedidos[pedidoIndex].estado = 'Cancelado';
            mostrarPedidos();
            pedidoACancelar = null;
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarCancelarPedidoModal'));
            modal.hide();
        }
    }
}

function abrirModalEditarPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
        document.getElementById('editPedidoId').value = pedido.id;
        document.getElementById('editPedidoCliente').value = pedido.cliente;
        document.getElementById('editPedidoFecha').value = pedido.fecha;
        document.getElementById('editPedidoTotal').value = pedido.total;
        document.getElementById('editPedidoEstado').value = pedido.estado;
        document.getElementById('editPedidoDireccion').value = pedido.direccion;

        const modal = new bootstrap.Modal(document.getElementById('editarPedidoModal'));
        modal.show();
    }
}

function validarFormularioPedido() {
    const cliente = document.getElementById('editPedidoCliente').value.trim();
    const fecha = document.getElementById('editPedidoFecha').value.trim();
    const total = document.getElementById('editPedidoTotal').value.trim();
    const estado = document.getElementById('editPedidoEstado').value.trim();
    const direccion = document.getElementById('editPedidoDireccion').value.trim();

    if (cliente === '') {
        mostrarError('editPedidoCliente', 'El cliente es obligatorio');
        return false;
    }

    if (fecha === '') {
        mostrarError('editPedidoFecha', 'La fecha es obligatoria');
        return false;
    }

    if (total === '' || isNaN(total) || parseFloat(total) <= 0) {
        mostrarError('editPedidoTotal', 'El total debe ser un número positivo');
        return false;
    }

    if (estado === '') {
        mostrarError('editPedidoEstado', 'El estado es obligatorio');
        return false;
    }

    if (direccion === '') {
        mostrarError('editPedidoDireccion', 'La dirección es obligatoria');
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

function guardarCambiosPedido() {
    limpiarErrores();
    if (validarFormularioPedido()) {
        const pedidoId = document.getElementById('editPedidoId').value;
        const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);

        if (pedidoIndex !== -1) {
            pedidos[pedidoIndex] = {
                id: pedidoId,
                cliente: document.getElementById('editPedidoCliente').value,
                fecha: document.getElementById('editPedidoFecha').value,
                total: parseFloat(document.getElementById('editPedidoTotal').value),
                estado: document.getElementById('editPedidoEstado').value,
                direccion: document.getElementById('editPedidoDireccion').value
            };

            mostrarPedidos();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarPedidoModal'));
            modal.hide();
        }
    }
}

function actualizarPaginacion() {
    const totalPages = Math.ceil(pedidos.length / itemsPerPage);
    const paginationElement = document.getElementById('pedidosPagination');
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
    const totalPages = Math.ceil(pedidos.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        mostrarPedidos();
        actualizarPaginacion();
    }
}

function realizarBusqueda() {
    const query = document.getElementById('searchInputPedidos').value;
    if (query.trim() === '') {
        pedidos = [...pedidosOriginales]; // Restaura todos los pedidos si la búsqueda está vacía
    } else {
        pedidos = pedidosOriginales.filter(pedido => 
            pedido.id.toLowerCase().includes(query.toLowerCase()) ||
            pedido.cliente.toLowerCase().includes(query.toLowerCase())
        );
    }
    currentPage = 1; // Volver a la primera página después de buscar
    mostrarPedidos();
    actualizarPaginacion();
}

function ordenarPedidos(columna) {
    if (columna === sortColumn) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columna;
        sortOrder = 'asc';
    }

    pedidos.sort((a, b) => {
        if (a[columna] < b[columna]) return sortOrder === 'asc' ? -1 : 1;
        if (a[columna] > b[columna]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1; // Volver a la primera página después de ordenar
    mostrarPedidos();
    actualizarPaginacion();
}

function filtrarPedidosPorEstado() {
    const estadoSeleccionado = document.getElementById('filtroEstadoPedido').value;

    if (estadoSeleccionado === '') {
        pedidos = [...pedidosOriginales];
    } else {
        pedidos = pedidosOriginales.filter(pedido => pedido.estado === estadoSeleccionado);
    }

    currentPage = 1;
    mostrarPedidos();
    actualizarPaginacion();
}

function configurarEventListeners() {
    document.getElementById('searchButtonPedidos').addEventListener('click', realizarBusqueda);
    document.getElementById('searchInputPedidos').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            realizarBusqueda();
        }
    });

    document.querySelectorAll('th a').forEach(th => {
        th.addEventListener('click', function(e) {
            e.preventDefault();
            const columna = this.getAttribute('data-sort');
            ordenarPedidos(columna);
        });
    });

    document.getElementById('pedidosPagination').addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.tagName === 'A' && e.target.hasAttribute('data-page')) {
            const newPage = parseInt(e.target.getAttribute('data-page'));
            cambiarPagina(newPage);
        }
    });

    document.getElementById('guardarPedidoBtn').addEventListener('click', guardarCambiosPedido);
    document.getElementById('confirmarCancelarPedidoBtn').addEventListener('click', cancelarPedido);
    document.getElementById('filtrarEstadoBtn').addEventListener('click', filtrarPedidosPorEstado);
}

export function activarPedidos() {
    cargarPedidos();
    configurarEventListeners();
}