const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
// Render nos da el puerto, o usamos 3000 para pruebas locales
const port = process.env.PORT || 3000;

// --- Conexión a la Base de Datos PostgreSQL ---
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: La variable de entorno DATABASE_URL no está definida.');
    process.exit(1); // Detiene el servidor si no hay conexión a la BD
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

// --- Endpoint de Autenticación ---
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'arlunaq' && password === 'arlunaq123') {
        console.log('Login exitoso para el usuario:', username);
        res.json({ token: 'token-real-desde-api-con-postgres' });
    } else {
        console.log('Login fallido para el usuario:', username);
        res.status(401).send('Usuario o contraseña incorrectos');
    }
});

// --- Endpoint de Sincronización de Pedidos ---
app.post('/orders', async (req, res) => {
    // ... (El resto del código de orders sigue igual)
});

// --- Endpoint para ver los pedidos guardados ---
app.get('/orders', async (req, res) => {
    // ... (El resto del código de get orders sigue igual)
});


app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});