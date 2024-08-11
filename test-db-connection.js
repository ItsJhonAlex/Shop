import pool from './assets/js/db.js';

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos');
    
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Resultado de la consulta de prueba:', rows[0].result);
    
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  } finally {
    pool.end();
  }
}

testConnection();