const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    precio: {
        type: Number,
        required: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    imagen: {
        type: String,
        required: true
    },
    vendedor: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);