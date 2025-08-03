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
    const myProductsContainer = document.getElementById('my-products-container');
    const editModal = document.getElementById('edit-modal');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('edit-form');
    const editNombreOriginalInput = document.getElementById('edit-nombre-original');
    const editNombreInput = document.getElementById('edit-nombre');
    const editPrecioInput = document.getElementById('edit-precio');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    const refreshProducts = () => {
        fetch('/api/my-products')
            .then(response => response.json())
            .then(data => displayMyProducts(data))
            .catch(error => console.error('Error al refrescar productos:', error));
    };

    function displayMyProducts(products) {
        if (!myProductsContainer) return;
        myProductsContainer.innerHTML = '';
        if (products.length === 0) {
            myProductsContainer.innerHTML = '<p>Aún no has subido ningún producto.</p>';
            return;
        }
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('producto');
            
            const creatorColor = generateColorFromString(product.vendedor);
            productDiv.style.setProperty('--creator-glow-color', `${creatorColor}55`);
            
            productDiv.innerHTML = `
                <img src="/img/${product.imagen}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p>Precio: $${product.precio}</p>
                <div>
                    <button class="edit-btn" data-nombre="${product.nombre}" data-precio="${product.precio}">Editar</button>
                    <button class="delete-btn" data-nombre="${product.nombre}">Eliminar</button>
                </div>
            `;
            myProductsContainer.appendChild(productDiv);
        });
    }

    myProductsContainer.addEventListener('click', (e) => { if (e.target.classList.contains('delete-btn')) { confirmDeleteBtn.dataset.nombre = e.target.dataset.nombre; deleteConfirmModal.classList.add('show'); } if (e.target.classList.contains('edit-btn')) { editNombreOriginalInput.value = e.target.dataset.nombre; editNombreInput.value = e.target.dataset.nombre; editPrecioInput.value = e.target.dataset.precio; editModal.classList.add('show'); } });
    const hideModals = () => { editModal.classList.remove('show'); deleteConfirmModal.classList.remove('show'); }
    closeModalBtn.onclick = hideModals; cancelDeleteBtn.onclick = hideModals; window.onclick = (event) => { if (event.target == editModal || event.target == deleteConfirmModal) { hideModals(); } }
    editForm.addEventListener('submit', (e) => { e.preventDefault(); const productData = { nombreOriginal: editNombreOriginalInput.value, nuevoNombre: editNombreInput.value, nuevoPrecio: parseFloat(editPrecioInput.value) }; fetch('/api/edit-product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(response => response.ok ? response.text() : response.text().then(text => Promise.reject(text))).then(message => { showNotification(message); hideModals(); refreshProducts(); }).catch(error => showNotification(`Error: ${error}`, 'error')); });
    confirmDeleteBtn.addEventListener('click', () => { const nombreProducto = confirmDeleteBtn.dataset.nombre; fetch('/api/delete-product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nombreProducto }) }).then(response => response.ok ? response.text() : response.text().then(text => Promise.reject(text))).then(message => { showNotification(message); hideModals(); refreshProducts(); }).catch(error => showNotification(`Error: ${error}`, 'error')); });
    refreshProducts();
});
