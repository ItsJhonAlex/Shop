const btnSignIn = document.getElementById("sign-in"),
      btnSignUp = document.getElementById("sign-up"),
      containerFormRegister = document.querySelector(".register"),
      containerFormLogin = document.querySelector(".login");

btnSignIn.addEventListener("click", e => {
    containerFormRegister.classList.add("hide");
    containerFormLogin.classList.remove("hide")
});

btnSignUp.addEventListener("click", e => {
    containerFormLogin.classList.add("hide");
    containerFormRegister.classList.remove("hide")
});

// Manejar el registro de usuario
const registroForm = document.getElementById('registroForm');
registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validar que todos los campos estén llenos
    if (!nombre || !email || !direccion || !password || !confirmPassword) {
        mostrarAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        mostrarAlerta('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password, direccion }),
        });

        if (!response.ok) {
            throw new Error('Error en el registro');
        }

        const data = await response.json();
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        mostrarAlerta('Registro exitoso', 'exito');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (error) {
        mostrarAlerta('Error al registrar: ' + error.message, 'error');
    }
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const alertaError = document.querySelector('.alerta-error');
    const alertaExito = document.querySelector('.alerta-exito');

    if (tipo === 'error') {
        alertaError.textContent = mensaje;
        alertaError.style.display = 'block';
        alertaExito.style.display = 'none';
    } else {
        alertaExito.textContent = mensaje;
        alertaExito.style.display = 'block';
        alertaError.style.display = 'none';
    }

    setTimeout(() => {
        alertaError.style.display = 'none';
        alertaExito.style.display = 'none';
    }, 3000);
}

// Manejar el inicio de sesión
const loginForm = document.querySelector('.form-login');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('[name="userEmail"]').value.trim();
    const password = loginForm.querySelector('[name="userPassword"]').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Error en el inicio de sesión');
        }

        const data = await response.json();
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        mostrarAlerta('Inicio de sesión exitoso', 'exito');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (error) {
        mostrarAlerta('Error al iniciar sesión: ' + error.message, 'error');
    }
});