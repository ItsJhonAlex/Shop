let clientesOriginales = []; // Nueva variable para almacenar todos los clientes
let clientes = [];
let sortColumn = 'id';
let sortOrder = 'asc';
let currentPage = 1;
const itemsPerPage = 10; // Puedes ajustar este número según tus necesidades

let clienteAEliminar = null;

function cargarClientes() {
    // Aquí deberías hacer una llamada a tu API o base de datos
    // Por ahora, usaremos datos de ejemplo
    clientesOriginales = [
        { id: 'CLI001', nombre: 'Juan Pérez', correo: 'juan@example.com', direccion: 'Calle 123' },
        { id: 'CLI002', nombre: 'María García', correo: 'maria@example.com', direccion: 'Avenida 456' },
        { id: 'CLI003', nombre: 'Carlos López', correo: 'carlos@example.com', direccion: 'Plaza 789' },
    ];
    clientes = [...clientesOriginales]; // Copia todos los clientes a la variable de trabajo
    mostrarClientes();
    actualizarPaginacion();
}

function mostrarClientes() {
    const tbody = document.getElementById('clientesTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const clientesPaginados = clientes.slice(startIndex, endIndex);

    clientesPaginados.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ID">${cliente.id}</td>
            <td data-label="Nombre">${cliente.nombre}</td>
            <td data-label="Correo">${cliente.correo}</td>
            <td data-label="Dirección">${cliente.direccion}</td>
            <td data-label="Acciones">
                <button class="btn btn-sm btn-primary editar-cliente" data-id="${cliente.id}" aria-label="Editar cliente ${cliente.nombre}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar-cliente" data-id="${cliente.id}" aria-label="Eliminar cliente ${cliente.nombre}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones de editar
    document.querySelectorAll('.editar-cliente').forEach(button => {
        button.addEventListener('click', function() {
            const clienteId = this.getAttribute('data-id');
            abrirModalEditarCliente(clienteId);
        });
    });

    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.eliminar-cliente').forEach(button => {
        button.addEventListener('click', function() {
            const clienteId = this.getAttribute('data-id');
            mostrarConfirmacionEliminarCliente(clienteId);
        });
    });
}

function mostrarConfirmacionEliminarCliente(clienteId) {
    clienteAEliminar = clienteId;
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarClienteModal'));
    modal.show();
}

function eliminarCliente() {
    if (clienteAEliminar) {
        clientes = clientes.filter(cliente => cliente.id !== clienteAEliminar);
        clientesOriginales = clientesOriginales.filter(cliente => cliente.id !== clienteAEliminar);
        mostrarClientes();
        actualizarPaginacion();
        clienteAEliminar = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarClienteModal'));
        modal.hide();
        mostrarAlerta('Cliente eliminado con éxito');
    }
}

function abrirModalEditarCliente(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
        document.getElementById('editClienteId').value = cliente.id;
        document.getElementById('editClienteNombre').value = cliente.nombre;
        document.getElementById('editClienteCorreo').value = cliente.correo;
        document.getElementById('editClienteDireccion').value = cliente.direccion;

        const modal = new bootstrap.Modal(document.getElementById('editarClienteModal'));
        modal.show();
    }
}

function guardarCambiosCliente() {
    limpiarErrores();
    if (validarFormularioCliente()) {
        const clienteId = document.getElementById('editClienteId').value;
        const clienteIndex = clientes.findIndex(c => c.id === clienteId);

        if (clienteIndex !== -1) {
            clientes[clienteIndex] = {
                id: clienteId, // Mantener el ID original
                nombre: document.getElementById('editClienteNombre').value,
                correo: document.getElementById('editClienteCorreo').value,
                direccion: document.getElementById('editClienteDireccion').value
            };

            mostrarClientes();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarClienteModal'));
            modal.hide();
            mostrarAlerta('Cambios guardados con éxito');
        }
    }
}

function actualizarPaginacion() {
    const totalPages = Math.ceil(clientes.length / itemsPerPage);
    const paginationElement = document.getElementById('clientesPagination');
    paginationElement.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botón "Anterior"
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Ir a la página anterior">&laquo;</a>`;
    ul.appendChild(liPrev);

    // Página actual
    const liCurrent = document.createElement('li');
    liCurrent.className = 'page-item active';
    liCurrent.innerHTML = `<span class="page-link">${currentPage}</span>`;
    ul.appendChild(liCurrent);

    // Botón "Siguiente"
    const liNext = document.createElement('li');
    liNext.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    liNext.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Ir a la página siguiente">&raquo;</a>`;
    ul.appendChild(liNext);

    // Información de página actual / total de páginas
    const liInfo = document.createElement('li');
    liInfo.className = 'page-item disabled';
    liInfo.innerHTML = `<span class="page-link">${currentPage}/${totalPages}</span>`;
    ul.appendChild(liInfo);

    paginationElement.appendChild(ul);
}

function cambiarPagina(newPage) {
    const totalPages = Math.ceil(clientes.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        mostrarClientes();
        actualizarPaginacion();
    }
}

function realizarBusqueda() {
    const query = document.getElementById('searchInputClientes').value;
    const resultados = buscarClientes(query);
    clientes = resultados;
    currentPage = 1; // Volver a la primera página después de buscar
    mostrarClientes();
    actualizarPaginacion();
}

function buscarClientes(query) {
    if (query.trim() === '') {
        return clientesOriginales; // Retorna todos los clientes si la búsqueda está vacía
    }
    return clientesOriginales.filter(cliente => 
        cliente.id.toLowerCase().includes(query.toLowerCase()) ||
        cliente.nombre.toLowerCase().includes(query.toLowerCase())
    );
}

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

    currentPage = 1; // Volver a la primera página después de ordenar
    mostrarClientes();
    actualizarPaginacion();
}

function filtrarClientesPorDireccion() {
    const direccionFiltro = document.getElementById('filtroDireccion').value.toLowerCase();

    if (direccionFiltro === '') {
        clientes = [...clientesOriginales];
    } else {
        clientes = clientesOriginales.filter(cliente => 
            cliente.direccion.toLowerCase().includes(direccionFiltro)
        );
    }

    currentPage = 1;
    mostrarClientes();
    actualizarPaginacion();
}

function configurarEventListeners() {
    document.getElementById('searchButtonClientes').addEventListener('click', realizarBusqueda);
    document.getElementById('searchInputClientes').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            realizarBusqueda();
        }
    });

    document.querySelectorAll('th a').forEach(th => {
        th.addEventListener('click', function(e) {
            e.preventDefault();
            const columna = this.getAttribute('data-sort');
            ordenarClientes(columna);
        });
    });

    document.getElementById('clientesPagination').addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.tagName === 'A' && e.target.hasAttribute('data-page')) {
            const newPage = parseInt(e.target.getAttribute('data-page'));
            cambiarPagina(newPage);
        }
    });

    document.getElementById('guardarClienteBtn').addEventListener('click', guardarCambiosCliente);

    document.getElementById('confirmarEliminarClienteBtn').addEventListener('click', eliminarCliente);

    document.getElementById('filtrarDireccionBtn').addEventListener('click', filtrarClientesPorDireccion);
}

function validarFormularioCliente() {
    const nombre = document.getElementById('editClienteNombre').value.trim();
    const correo = document.getElementById('editClienteCorreo').value.trim();
    const direccion = document.getElementById('editClienteDireccion').value.trim();

    if (nombre === '') {
        mostrarError('editClienteNombre', 'El nombre es obligatorio');
        return false;
    }

    if (correo === '') {
        mostrarError('editClienteCorreo', 'El correo es obligatorio');
        return false;
    }

    if (!validarCorreo(correo)) {
        mostrarError('editClienteCorreo', 'El correo no es válido');
        return false;
    }

    if (direccion === '') {
        mostrarError('editClienteDireccion', 'La dirección es obligatoria');
        return false;
    }

    return true;
}

function validarCorreo(correo) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(correo);
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

function mostrarAlerta(mensaje, tipo = 'success') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container-fluid').insertAdjacentElement('afterbegin', alertaDiv);
    
    // Remover la alerta después de 5 segundos
    setTimeout(() => {
        alertaDiv.remove();
    }, 5000);
}

export function activarClientes() {
    cargarClientes();
    configurarEventListeners();
}