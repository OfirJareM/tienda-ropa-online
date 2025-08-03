// --- FUNCIÓN GLOBAL DE NOTIFICACIONES (NUEVA) ---
function showNotification(message, type = 'success') {
    // Buscamos el contenedor de notificaciones, si no existe, lo creamos.
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`; // 'success' o 'error'
    notification.textContent = message;

    container.appendChild(notification);

    // Hacemos que la notificación aparezca
    setTimeout(() => {
        notification.classList.add('show');
    }, 100); // Pequeño retraso para que la transición funcione

    // Hacemos que la notificación desaparezca después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        // Esperamos a que la transición de salida termine para eliminar el elemento
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}
// --- FUNCIÓN PARA GENERAR UN COLOR BASADO EN UN TEXTO (NUEVA) ---
function generateColorFromString(str) {
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

// ... (El resto de tu código de global.js sigue aquí)


document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    
    const createNavbar = (user) => {
        const nav = document.createElement('nav');
        nav.innerHTML += '<a href="/">Inicio</a>';
        if (user) {
            nav.innerHTML += `<span>Bienvenido, ${user.username}!</span>`;
            if (user.role === 'vendedor') {
                nav.innerHTML += '<a href="/dashboard.html">Panel de Vendedor</a>';
            } else {
                nav.innerHTML += '<a href="/cart.html">Carrito</a>';
            }
            nav.innerHTML += '<a href="#" id="logout-btn">Logout</a>';
        } else {
            nav.innerHTML += '<a href="/iniciar-sesion.html">Login</a>';
            nav.innerHTML += '<a href="/register.html">Registro</a>';
        }
        
        const oldNav = header.querySelector('nav');
        if (oldNav) oldNav.remove();
        header.appendChild(nav);

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fetch('/logout', { method: 'POST' })
                    .then(() => {
                        localStorage.removeItem('carrito');
                        window.location.href = '/';
                    });
            });
        }
    };

    fetch('/api/user-status')
        .then(res => res.json())
        .then(data => {
            createNavbar(data.loggedIn ? data.user : null);
        });
});
