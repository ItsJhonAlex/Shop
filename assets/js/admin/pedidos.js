let pedidos = [];
let pedidosOriginales = [];
let currentPage = 1;
const pedidosPorPagina = 10;
let sortColumn = 'id';
let sortOrder = 'asc';

async function cargarPedidos() {
    try {
        const response = await fetch('/api/pedidos');
        if (!response.ok) {
            throw new Error('Error al cargar los pedidos');
        }
        pedidosOriginales = await response.json();
        pedidos = [...pedidosOriginales];
        mostrarPedidos();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los pedidos', 'danger');
    }
}

function mostrarPedidos() {
    const tbody = document.getElementById('pedidosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const inicio = (currentPage - 1) * pedidosPorPagina;
    const fin = inicio + pedidosPorPagina;
    const pedidosPagina = pedidos.slice(inicio, fin);

    pedidosPagina.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente_nombre || 'Cliente no disponible'}</td>
            <td>${new Date(pedido.fecha_pedido).toLocaleString()}</td>
            <td>$${parseFloat(pedido.total).toFixed(2)}</td>
            <td>${pedido.estado}</td>
            <td>${pedido.direccion_envio || 'No disponible'}</td>
            <td>
                <button class="btn btn-sm btn-info ver-detalles" data-id="${pedido.id}">Ver detalles</button>
                <button class="btn btn-sm btn-warning editar" data-id="${pedido.id}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar" data-id="${pedido.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarPaginacion() {
    const paginacion = document.getElementById('pedidosPagination');
    if (!paginacion) return;

    const totalPaginas = Math.ceil(pedidos.length / pedidosPorPagina);
    paginacion.innerHTML = '';

    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
    paginacion.appendChild(liAnterior);

    const liActual = document.createElement('li');
    liActual.className = 'page-item active';
    liActual.innerHTML = `<span class="page-link text-dark">${currentPage}</span>`;
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
    wrapper.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible" role="alert">
           ${mensaje}
           <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertPlaceholder.appendChild(wrapper);

    // No es necesario remover la alerta manualmente ya que la página se recargará
}

async function verDetallesPedido(pedidoId) {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del pedido');
        }
        const pedido = await response.json();
        const modalBody = document.getElementById('detallesPedidoModalBody');
        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${pedido.id}</p>
            <p><strong>Cliente:</strong> ${pedido.cliente_nombre || 'Usuario no disponible'}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha_pedido).toLocaleString()}</p>
            <p><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Dirección de envío:</strong> ${pedido.direccion_envio}</p>
            <h6>Productos:</h6>
            <ul>
                ${pedido.detalles && pedido.detalles.length > 0 ? pedido.detalles.map(detalle => `
                    <li>${detalle.producto_nombre || 'Producto no disponible'} - Cantidad: ${detalle.cantidad} - Precio: $${parseFloat(detalle.precio_unitario).toFixed(2)}</li>
                `).join('') : 'No hay detalles disponibles'}
            </ul>
        `;
        const modal = new bootstrap.Modal(document.getElementById('verDetallesPedidoModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los detalles del pedido', 'danger');
    }
}

async function abrirModalEditarPedido(pedidoId) {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos del pedido');
        }
        const pedido = await response.json();
        
        document.getElementById('editPedidoId').value = pedido.id;
        document.getElementById('editPedidoEstado').value = pedido.estado;
        document.getElementById('editPedidoDireccion').value = pedido.direccion_envio || '';

        const modal = new bootstrap.Modal(document.getElementById('editarPedidoModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los datos del pedido', 'danger');
    }
}

async function guardarCambiosPedido() {
    const form = document.getElementById('editarPedidoForm');
    const formData = new FormData(form);
    const pedidoId = formData.get('id');

    const pedidoActualizado = {
        id: pedidoId,
        estado: formData.get('estado'),
        direccion_envio: formData.get('direccion')
    };

    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoActualizado)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el pedido');
        }

        const pedidoActualizadoResponse = await response.json();
        
        // Actualizar el pedido en los arrays locales
        const index = pedidos.findIndex(p => p.id === pedidoActualizadoResponse.id);
        if (index !== -1) {
            pedidos[index] = { ...pedidos[index], ...pedidoActualizadoResponse };
            pedidosOriginales[index] = { ...pedidosOriginales[index], ...pedidoActualizadoResponse };
        }

        mostrarAlerta('Pedido actualizado con éxito', 'success');
        cerrarModal('editarPedidoModal');
        mostrarPedidos();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al actualizar el pedido', 'danger');
    }
}

function abrirModalConfirmarEliminar(pedidoId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarPedidoModal'));
    modal.show();
    document.getElementById('confirmarEliminarPedidoBtn').setAttribute('data-id', pedidoId);
}

async function eliminarPedido() {
    const pedidoId = this.getAttribute('data-id');
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el pedido');
        }

        // Cerrar el modal de confirmación
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarPedidoModal'));
        modal.hide();

        // Mostrar alerta de éxito
        mostrarAlerta('Pedido eliminado con éxito', 'success');

        // Recargar la página después de un breve retraso
        setTimeout(() => {
            window.location.reload();
        }, 1000); // Espera 1 segundo antes de recargar

    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        mostrarAlerta('Error al eliminar el pedido', 'danger');
    }
}

function cerrarModal(modalId) {
const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
if (modal) {
    modal.hide();
}
}

function ordenarPedidos(columna) {
if (columna === sortColumn) {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
} else {
    sortColumn = columna;
    sortOrder = 'asc';
}

pedidos.sort((a, b) => {
    let valorA = a[columna];
    let valorB = b[columna];

    if (columna === 'fecha_pedido') {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
    } else if (columna === 'total') {
        valorA = parseFloat(valorA);
        valorB = parseFloat(valorB);
    }

    if (valorA < valorB) return sortOrder === 'asc' ? -1 : 1;
    if (valorA > valorB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
});

mostrarPedidos();
actualizarPaginacion();
}

function realizarBusqueda() {
const query = document.getElementById('searchInputPedidos').value.toLowerCase();
pedidos = pedidosOriginales.filter(pedido => 
    pedido.id.toLowerCase().includes(query) ||
    pedido.cliente.toLowerCase().includes(query)
);
currentPage = 1;
mostrarPedidos();
actualizarPaginacion();
}

function filtrarPorEstado() {
const estado = document.getElementById('filtroEstadoPedido').value;
if (estado === '') {
    pedidos = [...pedidosOriginales];
} else {
    pedidos = pedidosOriginales.filter(pedido => pedido.estado === estado);
}
currentPage = 1;
mostrarPedidos();
actualizarPaginacion();
}

function configurarEventListeners() {
    const pedidosTableBody = document.getElementById('pedidosTableBody');
    if (pedidosTableBody) {
        pedidosTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('ver-detalles')) {
                const pedidoId = e.target.getAttribute('data-id');
                verDetallesPedido(pedidoId);
            } else if (e.target.classList.contains('editar')) {
                const pedidoId = e.target.getAttribute('data-id');
                abrirModalEditarPedido(pedidoId);
            } else if (e.target.classList.contains('eliminar')) {
                const pedidoId = e.target.getAttribute('data-id');
                abrirModalConfirmarEliminar(pedidoId);
            }
        });
    }

    const confirmarEliminarPedidoBtn = document.getElementById('confirmarEliminarPedidoBtn');
    if (confirmarEliminarPedidoBtn) {
        confirmarEliminarPedidoBtn.addEventListener('click', eliminarPedido);
    }

    const guardarPedidoBtn = document.getElementById('guardarPedidoBtn');
    if (guardarPedidoBtn) {
        guardarPedidoBtn.addEventListener('click', guardarCambiosPedido);
    }

    const searchButtonPedidos = document.getElementById('searchButtonPedidos');
    if (searchButtonPedidos) {
        searchButtonPedidos.addEventListener('click', realizarBusqueda);
    }

    const filtrarEstadoBtn = document.getElementById('filtrarEstadoBtn');
    if (filtrarEstadoBtn) {
        filtrarEstadoBtn.addEventListener('click', filtrarPorEstado);
    }

    const pedidosPagination = document.getElementById('pedidosPagination');
    if (pedidosPagination) {
        pedidosPagination.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                currentPage = parseInt(e.target.getAttribute('data-page'));
                mostrarPedidos();
                actualizarPaginacion();
            }
        });
    }

    const pedidosTable = document.getElementById('pedidosTable');
    if (pedidosTable) {
        pedidosTable.querySelector('thead').addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.hasAttribute('data-sort')) {
                e.preventDefault();
                ordenarPedidos(e.target.getAttribute('data-sort'));
            }
        });
    }
}

export function activarPedidos() {
    return new Promise((resolve) => {
        const checkContent = () => {
            const pedidosTableBody = document.getElementById('pedidosTableBody');
            const pedidosPagination = document.getElementById('pedidosPagination');
            if (pedidosTableBody && pedidosPagination) {
                cargarPedidos().then(() => {
                    configurarEventListeners();
                    mostrarPedidos();
                    resolve();
                });
            } else {
                setTimeout(checkContent, 100); // Verificar cada 100ms
            }
        };
        checkContent();
    });
}