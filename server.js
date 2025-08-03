require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();

console.log('--- INICIANDO PRUEBA DE CONEXIÓN EN VERCEL ---');
console.log('MONGO_URI encontrada en Vercel:', process.env.MONGO_URI ? 'Sí' : 'No');
console.log('SESSION_SECRET encontrada en Vercel:', process.env.SESSION_SECRET ? 'Sí' : 'No');

// Ruta principal para tener algo que mostrar
app.get('/', (req, res) => {
    res.send('Página de prueba de conexión. Revisa los logs de Vercel.');
});

// Intentamos conectar a la base de datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('**************************************************');
        console.log('*** ¡ÉXITO! CONEXIÓN A MONGODB ATLAS EXITOSA. ***');
        console.log('**************************************************');
    })
    .catch(err => {
        console.error('**************************************************');
        console.error('*** !!! FALLO DE CONEXIÓN A MONGODB:', err.message);
        console.error('**************************************************');
    });

module.exports = app;