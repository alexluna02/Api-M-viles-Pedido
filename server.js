const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
// Render nos da el puerto a través de una variable de entorno. Usamos 3000 como fallback para pruebas locales.
const port = process.env.PORT || 3000;

// --- Conexión a la Base de Datos PostgreSQL ---
const connectionString = process.env.DATABASE_URL;

// ¡IMPORTANTE! Verificamos que la variable de entorno con la URL de la BD exista.
if (!connectionString) {
    console.error('CRASH: La variable de entorno DATABASE_URL no fue encontrada.');
    console.error('Asegúrate de haberla añadido en la sección "Environment" de tu servicio en Render.');
    process.exit(1); // Detiene el servidor si no puede encontrar la BD.
}

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

createTable();

app.use(bodyParser.json());

// --- Endpoint de "Health Check" ---
// Esto nos permite verificar si el servidor está vivo desde un navegador.
app.get('/', (req, res) => {
    console.log('Health check recibido!');
    res.send('Hola! La API de pedidos está viva y funcionando.');
});

// --- Endpoint de Autenticación (con más logs para depurar) ---
app.post('/auth/login', (req, res) => {
    console.log('>>> Petición POST recibida en /auth/login');
    // Este log es crucial. Nos dirá si el cuerpo de la petición está llegando vacío.
    console.log('>>> Cuerpo de la petición (req.body):', JSON.stringify(req.body, null, 2));
    
    const { username, password } = req.body;

    if (username === 'arlunaq' && password === 'arlunaq123') {
        console.log('>>> LOGIN EXITOSO. Enviando token.');
        res.json({ token: 'token-real-desde-api-con-postgres' });
    } else {
        console.log('>>> LOGIN FALLIDO. Credenciales no coinciden o el body está vacío.');
        res.status(401).send('Usuario o contraseña incorrectos');
    }
});

// --- Endpoint de Sincronización de Pedidos ---
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

// --- Endpoint para ver los pedidos guardados ---
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