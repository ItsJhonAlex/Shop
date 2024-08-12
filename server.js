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
  const { nombre, precio, talla, color, stock, descripcion } = req.body;
  const imagenPath = req.file ? `/img/${req.file.filename}` : null; // Guardar solo la ruta

  try {
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
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});