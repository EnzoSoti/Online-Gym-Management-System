// Get DOM elements
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const fullName = document.getElementById('fullName');
const fullNameField = document.getElementById('fullNameField');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const toggleText = document.getElementById('toggleText');
const toggleButton = document.getElementById('toggleForm');
const welcomeText = document.getElementById('welcomeText');
const formSection = document.getElementById('formSection');
const showPasswordButton = document.getElementById('showPassword');

// API URL
const API_URL = 'http://localhost:3000/api';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Play sound function
const playSound = (soundId) => {
    const sound = document.getElementById(soundId);
    sound.play();
};

// Handle form submission
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const isLoginMode = formTitle.textContent === 'Sign in to Account';
    const sanitizedUsername = sanitizeInput(username.value.trim());
    const sanitizedPassword = password.value;
    const sanitizedFullName = isLoginMode ? '' : sanitizeInput(fullName.value.trim());

    try {
        const endpoint = isLoginMode ? '/login' : '/register';
        const requestBody = isLoginMode
            ? { username: sanitizedUsername, password: sanitizedPassword }
            : { full_name: sanitizedFullName, username: sanitizedUsername, password: sanitizedPassword };

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
            playSound('success-sound');
            if (isLoginMode) {
                sessionStorage.setItem('full_name', data.user.full_name);
                Toastify({
                    text: "Login successful!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                    stopOnFocus: true,
                    callback: () => window.location.href = '../customer file/customer.html'
                }).showToast();
            } else {
                Toastify({
                    text: "Your account has been created successfully!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                    stopOnFocus: true,
                    callback: toggleForms
                }).showToast();
            }
        } else {
            Toastify({
                text: data.error || (isLoginMode ? "Login Failed. Please check your credentials." : "Registration Failed. Try again."),
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                stopOnFocus: true
            }).showToast();
        }
    } catch (error) {
        playSound('success-sound');
        console.error('API Error:', error);
        Swal.fire({
            title: 'Oops!',
            text: 'Something went wrong. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444',
            background: '#fef2f2',
            iconColor: '#b91c1c',
            color: '#7f1d1d'
        });
    }
});

// Toggle between login and signup forms
function toggleForms() {
    const isLoginMode = formTitle.textContent === 'Sign in to Account';

    formTitle.textContent = isLoginMode ? 'Create Account' : 'Sign in to Account';
    formSubtitle.textContent = isLoginMode ? 'Join us and start your fitness journey' : 'Start managing your fitness journey today';
    toggleText.textContent = isLoginMode ? 'Already have an account?' : "Don't have an account?";
    toggleButton.textContent = isLoginMode ? 'Sign in here' : 'Sign up for free';
    welcomeText.innerHTML = isLoginMode
        ? `<h1 class="text-4xl font-bold text-white mb-6">Hello, Friend!</h1>
           <p class="text-white/80 text-lg">Fill in your details and start your journey with us</p>`
        : `<h1 class="text-4xl font-bold text-white mb-6">Welcome</h1>
           <p class="text-white/80 text-lg">Enter your personal details and start your journey with us</p>`;
    
    fullNameField.classList.toggle('hidden', isLoginMode);
    username.value = '';
    password.value = '';
    fullName.value = '';
}

// Add event listener to toggle button
toggleButton.addEventListener('click', function (e) {
    e.preventDefault();
    toggleForms();
});

// Clear form fields on page load
window.addEventListener('load', function () {
    username.value = '';
    password.value = '';
    fullName.value = '';
});

// Show/hide password functionality
showPasswordButton.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});
