// --- FUNCIÓN PARA GENERAR UN COLOR BASADO EN UN TEXTO ---
function generateColorFromString(str) {
    if (!str) return '#ffffff';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('productos-container');
    const filtersContainer = document.getElementById('filters-container');
    const searchBar = document.getElementById('search-bar');

    let allProducts = [];
    let currentUser = null;
    let currentCategory = 'Todos';
    let currentSearchTerm = '';

    function applyFiltersAndSearch() {
        let filteredProducts = allProducts;

        if (currentCategory !== 'Todos') {
            filteredProducts = filteredProducts.filter(p => 
                p.categoria && p.categoria.trim().toLowerCase() === currentCategory.toLowerCase()
            );
        }

        // --- LÓGICA DE BÚSQUEDA MEJORADA ---
        if (currentSearchTerm) {
            const searchTerm = currentSearchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                (p.categoria && p.categoria.toLowerCase().includes(searchTerm))
            );
        }

        mostrarProductos(filteredProducts);
    }

    function displayFilters(productos) {
        if (!filtersContainer) return;
        
        const categorias = ['Todos', ...new Set(productos
            .filter(p => p.categoria && typeof p.categoria === 'string')
            .map(p => p.categoria.trim().toLowerCase())
        )];

        filtersContainer.innerHTML = '';
        categorias.forEach(cat => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            button.dataset.categoria = cat;
            if (cat === 'Todos') button.classList.add('active');
            filtersContainer.appendChild(button);
        });
    }

    function mostrarProductos(productos) {
        if (!contenedorProductos) return;
        contenedorProductos.innerHTML = '';
        if (productos.length === 0) {
            contenedorProductos.innerHTML = '<p>No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }
        productos.forEach(producto => {
            const productLink = document.createElement('a');
            productLink.href = `/product.html?name=${encodeURIComponent(producto.nombre)}`;
            productLink.classList.add('producto-link');
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            const creatorColor = generateColorFromString(producto.vendedor);
            productoDiv.style.setProperty('--creator-glow-color', `${creatorColor}55`);
            let productoHTML = `<img src="/img/${producto.imagen}" alt="${producto.nombre}"><h3>${producto.nombre}</h3><p>Precio: $${producto.precio}</p>`;
            if (currentUser && currentUser.role === 'cliente') {
                productoHTML += `<button class="add-to-cart-btn" data-producto='${JSON.stringify(producto)}'>Agregar al carrito</button>`;
            }
            productoDiv.innerHTML = productoHTML;
            productLink.appendChild(productoDiv);
            contenedorProductos.appendChild(productLink);
        });
    }

    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.dataset.categoria;
                applyFiltersAndSearch();
            }
        });
    }

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            applyFiltersAndSearch();
        });
    }
    
    function agregarAlCarrito(producto) { const carrito = JSON.parse(localStorage.getItem('carrito')) || []; const productoExistente = carrito.find(item => item.nombre === producto.nombre); if (productoExistente) { productoExistente.cantidad += 1; } else { producto.cantidad = 1; carrito.push(producto); } localStorage.setItem('carrito', JSON.stringify(carrito)); showNotification(`"${producto.nombre}" fue agregado al carrito.`); }
    if (contenedorProductos) { contenedorProductos.addEventListener('click', (e) => { if (e.target && e.target.classList.contains('add-to-cart-btn')) { e.preventDefault(); const producto = JSON.parse(e.target.dataset.producto); agregarAlCarrito(producto); } }); }

    fetch('/api/user-status')
        .then(res => res.json())
        .then(statusData => {
            currentUser = statusData.loggedIn ? statusData.user : null;
            return fetch('/get-products');
        })
        .then(res => res.json())
        .then(productsData => {
            allProducts = productsData;
            displayFilters(allProducts);
            mostrarProductos(allProducts);
        })
        .catch(error => {
            console.error('Error:', error);
            if (contenedorProductos) {
                contenedorProductos.innerHTML = '<p>No se pudieron cargar los productos.</p>';
            }
        });
});

