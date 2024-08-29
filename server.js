import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// Servir archivos estáticos
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use('/img', express.static(join(__dirname, 'img')))
// Rutas para las vistas
app.get('/', (req, res) => res.sendFile(join(__dirname, 'views', 'index.html')));
app.get('/login', (req, res) => res.sendFile(join(__dirname, 'views', 'login.html')));
app.get('/shop', (req, res) => res.sendFile(join(__dirname, 'views', 'shop.html')));
app.get('/panel-admin', (req, res) => res.sendFile(join(__dirname, 'views', 'panel-admin.html')));

// Rutas para las vistas de admin
app.get('/admin/clientes', (req, res) => res.sendFile(join(__dirname, 'views', 'admin', 'clientes.html')));
app.get('/admin/pedidos', (req, res) => res.sendFile(join(__dirname, 'views', 'admin', 'pedidos.html')));
app.get('/admin/productos', (req, res) => res.sendFile(join(__dirname, 'views', 'admin', 'productos.html')));

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
  const { nombre, email, password, direccion } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, direccion, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, direccion, 'cliente']
    );

    const usuario = { id: result.insertId, nombre, email, direccion, rol: 'cliente' };
    res.status(201).json({ usuario });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { id, nombre, direccion, rol } = user;
    res.json({ usuario: { id, nombre, email, direccion, rol } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para la gestión de clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const [clientes] = await pool.query('SELECT id, nombre, email, direccion, rol FROM usuarios');
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [clientes] = await pool.query('SELECT id, nombre, email, direccion, rol FROM usuarios WHERE id = ?', [id]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(clientes[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { nombre, email, password, direccion, rol } = req.body;
  try {
    // Primero, verifica si el email ya existe
    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, direccion, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, direccion, rol]
    );
    const nuevoCliente = { id: result.insertId, nombre, email, direccion, rol };
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, direccion, rol } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, direccion = ?, rol = ? WHERE id = ?',
      [nombre, email, direccion, rol, id]
    );
    res.json({ id, nombre, email, direccion, rol });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Configuración de multer para manejar la carga de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'img'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
  }
});
const upload = multer({ storage });

// Rutas para la gestión de productos

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM productos');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo producto
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
  const { nombre, precio, talla, color, stock, descripcion } = req.body;
  const imagenPath = req.file ? `/img/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, precio, talla, color, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, precio, talla, color, stock, imagenPath, descripcion]
    );
    const nuevoProducto = { 
      id: result.insertId, 
      nombre, 
      precio: parseFloat(precio), 
      talla, 
      color, 
      stock: parseInt(stock), 
      imagen: imagenPath, 
      descripcion 
    };
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [productos] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(productos[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un producto
app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, talla, color, stock, descripcion, imagenActual } = req.body;
  let imagenPath = req.file ? `/img/${req.file.filename}` : imagenActual;

  try {
    // Si no se subió una nueva imagen y no hay imagen actual, mantener la imagen existente
    if (!imagenPath) {
      const [productoActual] = await pool.query('SELECT imagen FROM productos WHERE id = ?', [id]);
      imagenPath = productoActual[0].imagen;
    }

    await pool.query(
      'UPDATE productos SET nombre = ?, precio = ?, talla = ?, color = ?, stock = ?, imagen = ?, descripcion = ? WHERE id = ?',
      [nombre, precio, talla, color, stock, imagenPath, descripcion, id]
    );
    res.json({ id, nombre, precio, talla, color, stock, imagen: imagenPath, descripcion });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Primero, verifica si el producto está siendo utilizado en algún pedido
    const [detallesPedido] = await pool.query('SELECT * FROM detalles_pedido WHERE producto_id = ?', [id]);
    
    if (detallesPedido.length > 0) {
      // Si el producto está siendo utilizado, envía un error 400
      return res.status(400).json({ error: 'No se puede eliminar el producto porque está asociado a uno o más pedidos.' });
    }

    // Si el producto no está siendo utilizado, procede con la eliminación
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para la gestión de pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const [pedidos] = await pool.query(`
            SELECT p.*, u.nombre as cliente_nombre 
            FROM pedidos p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC
        `);
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [pedidos] = await pool.query('SELECT p.*, u.nombre as cliente_nombre FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id WHERE p.id = ?', [id]);
    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const pedido = pedidos[0];

    const [detalles] = await pool.query(`
      SELECT dp.*, pr.nombre as producto_nombre 
      FROM detalles_pedido dp 
      LEFT JOIN productos pr ON dp.producto_id = pr.id 
      WHERE dp.pedido_id = ?
    `, [id]);

    pedido.detalles = detalles;
    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  const { usuario_id, total, direccion_envio } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO pedidos (usuario_id, total, direccion_envio) VALUES (?, ?, ?)',
      [usuario_id, total, direccion_envio]
    );
    const nuevoPedido = { id: result.insertId, usuario_id, total, direccion_envio, estado: 'Pendiente' };
    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, direccion_envio } = req.body;
  try {
    // Obtener el pedido actual
    const [pedidoActual] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    
    if (pedidoActual.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Actualizar solo el estado y la dirección de envío
    await pool.query(
      'UPDATE pedidos SET estado = ?, direccion_envio = ? WHERE id = ?',
      [estado, direccion_envio, id]
    );

    // Obtener el pedido actualizado
    const [pedidoActualizado] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    
    res.json(pedidoActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Primero, eliminamos los detalles del pedido
    await pool.query('DELETE FROM detalles_pedido WHERE pedido_id = ?', [id]);
    
    // Luego, eliminamos el pedido
    const [result] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json({ message: 'Pedido eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para la gestión de detalles de pedidos
app.get('/api/detalles-pedido/:pedidoId', async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const [detalles] = await pool.query('SELECT * FROM detalles_pedido WHERE pedido_id = ?', [pedidoId]);
    res.json(detalles);
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/detalles-pedido', async (req, res) => {
  const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
      [pedido_id, producto_id, cantidad, precio_unitario]
    );
    const nuevoDetalle = { id: result.insertId, pedido_id, producto_id, cantidad, precio_unitario };
    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error('Error al crear detalle de pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para la gestión del carrito
app.get('/api/carrito/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const [items] = await pool.query('SELECT * FROM carrito WHERE usuario_id = ?', [usuarioId]);
    res.json(items);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/carrito', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
      [usuario_id, producto_id, cantidad]
    );
    const nuevoItem = { id: result.insertId, usuario_id, producto_id, cantidad };
    res.status(201).json(nuevoItem);
  } catch (error) {
    console.error('Error al agregar item al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/carrito/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  try {
    await pool.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, id]);
    res.json({ id, cantidad });
  } catch (error) {
    console.error('Error al actualizar item del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/carrito/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM carrito WHERE id = ?', [id]);
    res.json({ message: 'Item eliminado del carrito con éxito' });
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});