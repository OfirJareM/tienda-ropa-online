document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const datalist = document.getElementById('categorias-sugeridas');

    // --- Cargar sugerencias de categorías al iniciar ---
    fetch('/api/categories')
        .then(res => res.json())
        .then(categories => {
            if (datalist) {
                datalist.innerHTML = '';
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    datalist.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error al cargar categorías:', error));

    // --- Manejar el envío del formulario ---
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            fetch('/upload-product', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.ok ? response.text() : response.text().then(text => Promise.reject(text)))
            .then(data => {
                showNotification('Producto subido con éxito');
                form.reset();
            })
            .catch((error) => {
                showNotification(`Error al subir: ${error}`, 'error');
            });
        });
    }
});