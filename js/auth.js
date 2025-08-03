document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            .then(response => {
                if (response.ok) {
                    showNotification('¡Registro exitoso! Serás redirigido.');
                    setTimeout(() => {
                        window.location.href = '/iniciar-sesion.html';
                    }, 1500);
                } else {
                    response.text().then(text => showNotification(text, 'error'));
                }
            })
            .catch(err => showNotification('Error de red. Inténtalo de nuevo.', 'error'));
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (response.ok) {
                    showNotification('¡Login exitoso!');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    response.text().then(text => showNotification(text, 'error'));
                }
            })
            .catch(err => showNotification('Error de red. Inténtalo de nuevo.', 'error'));
        });
    }
});
