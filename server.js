const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// --- Conexión a la Base de Datos PostgreSQL ---
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('CRASH: La variable de entorno DATABASE_URL no fue encontrada.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTable = async () => {
    // ... (código de createTable sin cambios)
};
createTable();

app.use(bodyParser.json());

// --- NUEVO: Endpoint de "Health Check" ---
app.get('/', (req, res) => {
    console.log('Health check recibido!');
    res.send('Hola! La API de pedidos está viva y funcionando.');
});

// --- Endpoint de Autenticación con más LOGS ---
app.post('/auth/login', (req, res) => {
    console.log('>>> Petición POST recibida en /auth/login');
    console.log('>>> Cuerpo de la petición (req.body):', req.body);
    
    const { username, password } = req.body;

    if (username === 'arlunaq' && password === 'arlunaq123') {
        console.log('>>> LOGIN EXITOSO. Enviando token.');
        res.json({ token: 'token-real-desde-api-con-postgres' });
    } else {
        console.log('>>> LOGIN FALLIDO. Credenciales no coinciden o el body está vacío.');
        res.status(401).send('Usuario o contraseña incorrectos');
    }
});

// --- Otros Endpoints ---
app.post('/orders', async (req, res) => {
    // ... (código sin cambios)
});

app.get('/orders', async (req, res) => {
    // ... (código sin cambios)
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
