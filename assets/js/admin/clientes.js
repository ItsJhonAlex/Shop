let clientes = [];
let clientesOriginales = [];
let currentPage = 1;
const clientesPorPagina = 10;

async function cargarClientes() {
    try {
        const response = await fetch('/api/clientes');
        if (!response.ok) {
            throw new Error('Error al cargar los clientes');
        }
        clientesOriginales = await response.json();
        clientes = [...clientesOriginales];
        mostrarClientes();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los clientes', 'danger');
    }
}

function mostrarClientes() {
    const tbody = document.getElementById('clientesTableBody');
    tbody.innerHTML = '';
    const inicio = (currentPage - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = clientes.slice(inicio, fin);

    clientesPagina.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.direccion || ''}</td>
            <td>${cliente.rol}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info ver-mas" data-id="${cliente.id}">Ver más</button>
                <button class="btn btn-sm btn-primary editar" data-id="${cliente.id}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar" data-id="${cliente.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);
    const paginacion = document.getElementById('clientesPagination');
    paginacion.innerHTML = '';

    // Botón "Anterior"
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
    paginacion.appendChild(liAnterior);

    // Página actual
    const liActual = document.createElement('li');
    liActual.className = 'page-item active';
    liActual.innerHTML = `<span class="page-link text-dark">${currentPage}</span>`;
    paginacion.appendChild(liActual);

    // Botón "Siguiente"
    const liSiguiente = document.createElement('li');
    liSiguiente.className = `page-item ${currentPage === totalPaginas ? 'disabled' : ''}`;
    liSiguiente.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>`;
    paginacion.appendChild(liSiguiente);

    // Información de página actual / total de páginas
    const liInfo = document.createElement('li');
    liInfo.className = 'page-item disabled';
    liInfo.innerHTML = `<span class="page-link">${currentPage}/${totalPaginas}</span>`;
    paginacion.appendChild(liInfo);
}

let sortColumn = 'id';
let sortOrder = 'asc';

function ordenarClientes(columna) {
    if (columna === sortColumn) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columna;
        sortOrder = 'asc';
    }

    clientes.sort((a, b) => {
        if (a[columna] < b[columna]) return sortOrder === 'asc' ? -1 : 1;
        if (a[columna] > b[columna]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    mostrarClientes();
    actualizarPaginacion();
}

async function verMasCliente(id) {
    try {
        const response = await fetch(`/api/clientes/${id}`);
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del cliente');
        }
        const cliente = await response.json();
        const modalBody = document.getElementById('verMasClienteBody');
        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${cliente.id}</p>
            <p><strong>Nombre:</strong> ${cliente.nombre}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>
            <p><strong>Rol:</strong> ${cliente.rol}</p>
        `;
        const modal = new bootstrap.Modal(document.getElementById('verMasClienteModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los detalles del cliente', 'danger');
    }
}

async function editarCliente(id) {
    try {
        const response = await fetch(`/api/clientes/${id}`);
        if (!response.ok) {
            throw new Error('Error al cargar los datos del cliente');
        }
        const cliente = await response.json();
        document.getElementById('editClienteId').value = cliente.id;
        document.getElementById('editNombre').value = cliente.nombre;
        document.getElementById('editEmail').value = cliente.email;
        document.getElementById('editDireccion').value = cliente.direccion || '';
        document.getElementById('editRol').value = cliente.rol;
        const modal = new bootstrap.Modal(document.getElementById('editarClienteModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los datos del cliente', 'danger');
    }
}

async function guardarCambiosCliente() {
    const clienteId = document.getElementById('editClienteId').value;
    const clienteActualizado = {
        nombre: document.getElementById('editNombre').value,
        email: document.getElementById('editEmail').value,
        direccion: document.getElementById('editDireccion').value,
        rol: document.getElementById('editRol').value
    };

    try {
        const response = await fetch(`/api/clientes/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteActualizado)
        });

        if (response.ok) {
            const index = clientesOriginales.findIndex(c => c.id === clienteId);
            if (index !== -1) {
                clientesOriginales[index] = { ...clientesOriginales[index], ...clienteActualizado };
                clientes = [...clientesOriginales];
                mostrarClientes();
                actualizarPaginacion();
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarClienteModal'));
            modal.hide();
            mostrarAlerta('Cliente actualizado con éxito', 'success');
        } else {
            throw new Error('Error al actualizar el cliente');
        }
    } catch (error) {
        console.error('Error al guardar los cambios del cliente:', error);
        mostrarAlerta('Error al guardar los cambios del cliente', 'danger');
    }
}

function mostrarConfirmacionEliminarCliente(e) {
    const clienteId = e.target.getAttribute('data-id');
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarClienteModal'));
    document.getElementById('confirmarEliminarClienteBtn').setAttribute('data-id', clienteId);
    modal.show();
}

async function eliminarCliente() {
    const clienteId = document.getElementById('confirmarEliminarClienteBtn').getAttribute('data-id');
    try {
        const response = await fetch(`/api/clientes/${clienteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            clientesOriginales = clientesOriginales.filter(c => c.id !== clienteId);
            clientes = [...clientesOriginales];
            mostrarClientes();
            actualizarPaginacion();
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarClienteModal'));
            modal.hide();
            mostrarAlerta('Cliente eliminado con éxito', 'success');
        } else {
            throw new Error('Error al eliminar el cliente');
        }
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        mostrarAlerta('Error al eliminar el cliente', 'danger');
    }
}

async function agregarNuevoCliente() {
    const nuevoCliente = {
        nombre: document.getElementById('nuevoNombre').value,
        email: document.getElementById('nuevoEmail').value,
        password: document.getElementById('nuevaPassword').value,
        direccion: document.getElementById('nuevaDireccion').value,
        rol: document.getElementById('nuevoRol').value
    };

    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoCliente)
        });

        if (response.ok) {
            const clienteCreado = await response.json();
            clientesOriginales.push(clienteCreado);
            clientes = [...clientesOriginales];
            mostrarClientes();
            actualizarPaginacion();
            const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoClienteModal'));
            modal.hide();
            mostrarAlerta('Cliente agregado con éxito', 'success');
            // Limpiar el formulario
            document.getElementById('nuevoClienteForm').reset();
        } else {
            throw new Error('Error al agregar el cliente');
        }
    } catch (error) {
        console.error('Error al agregar el nuevo cliente:', error);
        mostrarAlerta('Error al agregar el nuevo cliente', 'danger');
    }
}

function mostrarAlerta(mensaje, tipo) {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').insertAdjacentElement('afterbegin', alertaDiv);
    
    setTimeout(() => {
        alertaDiv.remove();
    }, 5000);
}

function configurarEventListeners() {
    const searchButton = document.getElementById('searchButtonClientes');
    if (searchButton) {
        searchButton.addEventListener('click', realizarBusqueda);
    }

    const searchInput = document.getElementById('searchInputClientes');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                realizarBusqueda();
            }
        });
    }

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            ordenarClientes(this.getAttribute('data-sort'));
        });
    });

    const filtrarDireccionBtn = document.getElementById('filtrarDireccionBtn');
    if (filtrarDireccionBtn) {
        filtrarDireccionBtn.addEventListener('click', filtrarPorDireccion);
    }

    const guardarEditarClienteBtn = document.getElementById('guardarEditarClienteBtn');
    if (guardarEditarClienteBtn) {
        guardarEditarClienteBtn.addEventListener('click', guardarCambiosCliente);
    }

    const confirmarEliminarClienteBtn = document.getElementById('confirmarEliminarClienteBtn');
    if (confirmarEliminarClienteBtn) {
        confirmarEliminarClienteBtn.addEventListener('click', eliminarCliente);
    }

    const guardarNuevoClienteBtn = document.getElementById('guardarNuevoClienteBtn');
    if (guardarNuevoClienteBtn) {
        guardarNuevoClienteBtn.addEventListener('click', agregarNuevoCliente);
    }

    const clientesTableBody = document.getElementById('clientesTableBody');
    if (clientesTableBody) {
        clientesTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('ver-mas')) {
                verMasCliente(e.target.getAttribute('data-id'));
            } else if (e.target.classList.contains('editar')) {
                editarCliente(e.target.getAttribute('data-id'));
            } else if (e.target.classList.contains('eliminar')) {
                mostrarConfirmacionEliminarCliente(e);
            }
        });
    }

    const clientesPagination = document.getElementById('clientesPagination');
    if (clientesPagination) {
        clientesPagination.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                currentPage = parseInt(e.target.getAttribute('data-page'));
                mostrarClientes();
                actualizarPaginacion();
            }
        });
    }
}

function realizarBusqueda() {
    const query = document.getElementById('searchInputClientes').value.toLowerCase();
    clientes = clientesOriginales.filter(cliente => 
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        (cliente.direccion && cliente.direccion.toLowerCase().includes(query))
    );
    currentPage = 1;
    mostrarClientes();
    actualizarPaginacion();
}

function filtrarPorDireccion() {
    const direccion = document.getElementById('filtroDireccion').value.toLowerCase();
    clientes = clientesOriginales.filter(cliente => 
        cliente.direccion && cliente.direccion.toLowerCase().includes(direccion)
    );
    currentPage = 1;
    mostrarClientes();
    actualizarPaginacion();
}

export function activarClientes() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cargarClientes();
            configurarEventListeners();
        });
    } else {
        cargarClientes();
        configurarEventListeners();
    }
}