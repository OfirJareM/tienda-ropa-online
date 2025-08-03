document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    function mostrarItemsCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        cartItemsContainer.innerHTML = '';
        let totalGeneral = 0;

        if (carrito.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            totalPriceElement.textContent = '0.00';
            return;
        }

        carrito.forEach((item, index) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = item.cantidad || 0;
            const subtotal = precio * cantidad;
            totalGeneral += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            
            let imagenHTML = '';
            if (item.imagen) {
                imagenHTML = `<img src="/img/${item.imagen}" alt="${item.nombre}" class="cart-item-image">`;
            }

            itemDiv.innerHTML = `
                <div class="cart-item-details">
                    ${imagenHTML}
                    <span>${item.nombre} ($${precio.toFixed(2)})</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                    <span class="quantity">${cantidad}</span>
                    <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    <span class="subtotal">$${subtotal.toFixed(2)}</span>
                    <button class="remove-item-btn" data-index="${index}">Eliminar</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        totalPriceElement.textContent = totalGeneral.toFixed(2);
    }

    function actualizarCantidad(index, accion) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const item = carrito[index];
        if (item) {
            if (accion === 'increase') {
                item.cantidad += 1;
            } else if (accion === 'decrease') {
                item.cantidad -= 1;
                if (item.cantidad <= 0) {
                    carrito.splice(index, 1);
                }
            }
            localStorage.setItem('carrito', JSON.stringify(carrito));
            mostrarItemsCarrito();
        }
    }

    function eliminarDelCarrito(index) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarItemsCarrito();
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (!target.dataset.index) return;
            const index = parseInt(target.dataset.index, 10);
            if (target.classList.contains('quantity-btn')) {
                actualizarCantidad(index, target.dataset.action);
            }
            if (target.classList.contains('remove-item-btn')) {
                eliminarDelCarrito(index);
            }
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showNotification('¡Gracias por tu compra! (Esto es una simulación)');
            localStorage.removeItem('carrito');
            mostrarItemsCarrito();
        });
    }

    mostrarItemsCarrito();
});