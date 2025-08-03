document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');

    // 1. Obtenemos los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('name'); // Obtenemos el valor del parámetro 'name'

    if (!productName) {
        productDetailContainer.innerHTML = '<p>Producto no especificado.</p>';
        return;
    }

    // 2. Pedimos la información de ese producto específico al servidor
    // Usamos encodeURIComponent para asegurarnos de que los nombres con espacios o caracteres especiales funcionen
    fetch(`/api/product/${encodeURIComponent(productName)}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(product => {
            // 3. Mostramos la información del producto
            document.title = product.name; // Cambiamos el título de la página
            productDetailContainer.innerHTML = `
                <div class="product-detail-layout">
                    <div class="product-detail-image">
                        <img src="/img/${product.imagen}" alt="${product.nombre}">
                    </div>
                    <div class="product-detail-info">
                        <h2>${product.nombre}</h2>
                        <p class="price">Precio: $${product.precio}</p>
                        <p>Vendido por: ${product.vendedor}</p>
                        <!-- Aquí podríamos añadir una descripción más larga en el futuro -->
                        <button class="add-to-cart-btn" data-producto='${JSON.stringify(product)}'>Agregar al carrito</button>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            productDetailContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        });
    
    // Lógica para el botón "Agregar al carrito" en esta página
    productDetailContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const producto = JSON.parse(e.target.dataset.producto);
            agregarAlCarrito(producto);
        }
    });

    function agregarAlCarrito(producto) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoExistente = carrito.find(item => item.nombre === producto.nombre);
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            producto.cantidad = 1;
            carrito.push(producto);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        showNotification(`"${producto.nombre}" fue agregado al carrito.`);
    }
});
