const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// --- Conexión a la Base de Datos PostgreSQL ---
// Usamos la variable de entorno para Render, y tu URL externa para pruebas locales.
const connectionString = process.env.DATABASE_URL || 'postgresql://bdd_pedidos_user:GrZKlmSVbsfYOAQySm0Frl9Eyb7Q51d2@dpg-d6d7fpv5r7bs73ardarg-a.oregon-postgres.render.com/bdd_pedidos';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones a Render
    }
});

// --- Función para Crear la Tabla si no Existe ---
const createTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id SERIAL PRIMARY KEY,
            android_id INTEGER,
            nombreCliente VARCHAR(255),
            telefono VARCHAR(50),
            direccion TEXT,
            detalle TEXT,
            tipoPago VARCHAR(50),
            fotoPath TEXT,
            latitud DOUBLE PRECISION,
            longitud DOUBLE PRECISION,
            fechaCreacion BIGINT,
            estado VARCHAR(50)
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Tabla "pedidos" verificada o creada con éxito.');
    } catch (err) {
        console.error('Error al verificar/crear la tabla:', err.stack);
    }
};

// Llamamos a la función al iniciar el servidor
createTable();

app.use(bodyParser.json());

// --- Endpoints ---

// POST /auth/login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'arlunaq' && password === 'arlunaq123') {
        res.json({ token: 'token-real-desde-api-con-postgres' });
    } else {
        res.status(401).send('Usuario o contraseña incorrectos');
    }
});

// POST /orders
app.post('/orders', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).send('Acceso denegado');
    }
    
    try {
        const p = req.body;
        const insertQuery = `
            INSERT INTO pedidos(android_id, nombreCliente, telefono, direccion, detalle, tipoPago, fotoPath, latitud, longitud, fechaCreacion, estado)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [p.id, p.nombreCliente, p.telefono, p.direccion, p.detalle, p.tipoPago, p.fotoPath, p.latitud, p.longitud, p.fechaCreacion, p.estado];
        
        await pool.query(insertQuery, values);
        console.log('Nuevo pedido guardado en PostgreSQL:', p.nombreCliente);
        res.status(200).send('Pedido sincronizado con éxito');

    } catch (error) {
        console.error('Error al guardar el pedido en PostgreSQL:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// GET /orders
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).send('Error al obtener los pedidos');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});