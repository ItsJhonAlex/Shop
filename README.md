# Proyecto de Tienda en Línea y Panel de Administración

Este proyecto consiste en una tienda en línea con un panel de administración integrado. Incluye funcionalidades para gestionar clientes, productos y pedidos.

## Estructura del Proyecto
proyecto/
│
├── assets/
│ ├── css/
│ │ ├── admin.css
│ │ ├── login.css
│ │ ├── normalize.css
│ │ ├── shop.css
│ │ └── styles.css
│ │
│ ├── js/
│ │ ├── admin/
│ │ │ ├── clientes.js
│ │ │ ├── pedidos.js
│ │ │ └── productos.js
│ │ │
│ │ ├── login.js
│ │ ├── auth.js
│ │ ├── db.js
│ │ ├── main.js
│ │ ├── productos.js
│ │ ├── navegacion.js
│ │ └── shop.js
│ │
│ └── img/
│ └── (imágenes del proyecto)
│
├── views/
│ ├── admin/
│ │ ├── clientes.html
│ │ ├── pedidos.html
│ │ └── productos.html
│ │
│ ├── index.html
│ ├── login.html
│ ├── panel-admin.html
│ └── shop.html
│
├── server.js
├── .env
├── package.json
└── README.md

## Requisitos

- Servidor web (Apache, Nginx, etc.)
- Navegador web moderno
- [Otros requisitos específicos del proyecto]

## Configuración

1. Clona este repositorio en tu servidor web local:
   ```
   git clone [URL_DEL_REPOSITORIO]
   ```

2. Configura tu servidor web para que sirva el proyecto desde la carpeta raíz.

3. Asegúrate de que todas las rutas en los archivos HTML y JavaScript sean correctas según la estructura de tu servidor.

## Uso

### Tienda en Línea

- Accede a `index.html` para ver la página principal de la tienda.
- Navega a `shop.html` para ver los productos y realizar compras.

### Panel de Administración

1. Accede a `login.html` e inicia sesión con las credenciales de administrador.
2. Una vez autenticado, serás redirigido a `panel-admin.html`.
3. Desde el panel de administración, puedes gestionar:
   - Clientes
   - Productos
   - Pedidos

## Funcionalidades Principales

- **Gestión de Clientes**: Añadir, editar, eliminar y buscar clientes.
- **Gestión de Productos**: Añadir, editar, eliminar y buscar productos.
- **Gestión de Pedidos**: Ver, actualizar y cancelar pedidos.
- **Autenticación**: Sistema de login para acceder al panel de administración.
- **Responsive Design**: Interfaz adaptable a diferentes dispositivos.

## Desarrollo

### Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- [Otras tecnologías o frameworks utilizados]

### Tareas Pendientes

- [ ] Implementar autenticación en el backend
- [ ] Conectar con una base de datos real
- [ ] Añadir funcionalidad de carrito de compras
- [ ] Implementar sistema de pagos
- [ ] Mejorar la seguridad (HTTPS, sanitización de inputs, etc.)
- [ ] Optimizar el rendimiento (minificación de assets, lazy loading, etc.)

