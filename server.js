require('dotenv').config(); // Carga las variables de entorno del archivo .env
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const multer = require('multer');
const mongoose = require('mongoose'); // Importamos mongoose

// Importamos los modelos
const User = require('./models/User');
const Product = require('./models/Product');

const app = express();
const PORT = 3000;

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'img/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- CONFIGURACIÓN DE SESIÓN ---
app.use(session({
    store: new FileStore({ path: './sessions' }),
    secret: 'un secreto muy secreto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Middlewares de autenticación (sin cambios)
const checkAuth = (req, res, next) => { if (req.session.user) next(); else res.status(401).send('Acceso no autorizado.'); };
const checkVendedor = (req, res, next) => { if (req.session.user && req.session.user.role === 'vendedor') next(); else res.status(403).send('Acceso denegado.'); };

// --- RUTAS PRINCIPALES ---
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// --- RUTAS DE PRODUCTOS (AHORA 100% CON MONGODB) ---
app.get('/get-products', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (err) {
        res.status(500).send('Error al obtener los productos.');
    }
});

app.post('/upload-product', checkAuth, checkVendedor, upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio, categoria } = req.body;
        const imagen = req.file ? req.file.filename : null;
        if (!imagen) return res.status(400).send('No se subió ninguna imagen.');
        
        const nuevoProducto = new Product({
            nombre,
            precio: parseFloat(precio),
            categoria,
            imagen,
            vendedor: req.session.user.username
        });
        await nuevoProducto.save();
        res.status(200).send('Producto guardado!');
    } catch (err) {
        res.status(500).send('Error al guardar el producto.');
    }
});

app.get('/api/product/:name', async (req, res) => {
    try {
        const producto = await Product.findOne({ nombre: req.params.name });
        if (producto) res.json(producto);
        else res.status(404).send('Producto no encontrado.');
    } catch (err) {
        res.status(500).send('Error al buscar el producto.');
    }
});

app.post('/api/delete-product', checkAuth, checkVendedor, async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ 
            nombre: req.body.nombre, 
            vendedor: req.session.user.username 
        });
        if (!result) return res.status(404).send('Producto no encontrado o no tienes permiso.');
        res.status(200).send('Producto eliminado con éxito.');
    } catch (err) {
        res.status(500).send('Error al eliminar el producto.');
    }
});

app.post('/api/edit-product', checkAuth, checkVendedor, async (req, res) => {
    try {
        const { nombreOriginal, nuevoNombre, nuevoPrecio } = req.body;
        const result = await Product.findOneAndUpdate(
            { nombre: nombreOriginal, vendedor: req.session.user.username },
            { nombre: nuevoNombre, precio: nuevoPrecio },
            { new: true }
        );
        if (!result) return res.status(404).send('Producto no encontrado o no tienes permiso.');
        res.status(200).send('Producto actualizado con éxito.');
    } catch (err) {
        res.status(500).send('Error al actualizar el producto.');
    }
});

app.get('/api/my-products', checkAuth, checkVendedor, async (req, res) => {
    try {
        const misProductos = await Product.find({ vendedor: req.session.user.username });
        res.json(misProductos);
    } catch (err) {
        res.status(500).send('Error al obtener tus productos.');
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categorias = await Product.distinct('categoria');
        res.json(categorias.sort());
    } catch (err) {
        res.status(500).send('Error al obtener las categorías.');
    }
});

// --- RUTAS DE USUARIOS (AHORA 100% CON MONGODB) ---
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).send('El nombre de usuario ya existe.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).send('Usuario registrado con éxito.');
    } catch (err) {
        res.status(500).send('Error al registrar el usuario.');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Usuario o contraseña incorrectos.');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Usuario o contraseña incorrectos.');

        req.session.user = { username: user.username, role: user.role };
        res.status(200).json({ message: 'Login exitoso', user: req.session.user });
    } catch (err) {
        res.status(500).send('Error al iniciar sesión.');
    }
});

app.post('/logout', (req, res) => { req.session.destroy(err => { if (err) return res.status(500).send('No se pudo cerrar la sesión.'); res.clearCookie('connect.sid'); res.status(200).send('Sesión cerrada con éxito.'); }); });
app.get('/api/user-status', (req, res) => { if (req.session.user) { res.json({ loggedIn: true, user: req.session.user }); } else { res.json({ loggedIn: false }); } });

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
