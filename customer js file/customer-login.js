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

// Handle form submission
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const isLoginMode = formTitle.textContent === 'Sign in to Account';

    // Validate and sanitize inputs
    const sanitizedUsername = sanitizeInput(username.value.trim());
    const sanitizedPassword = password.value; // Don't sanitize password
    const sanitizedFullName = isLoginMode ? '' : sanitizeInput(fullName.value.trim());

    try {
        function playSound(soundId) {
            const sound = document.getElementById(soundId);
            sound.play();
        }

        if (isLoginMode) {
            // Handle Login
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: sanitizedUsername,
                    password: sanitizedPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                playSound('success-sound');
                sessionStorage.setItem('full_name', data.user.full_name); // Store full name in sessionStorage
                Swal.fire({
                    title: '🎉 Welcome!',
                    text: 'Login successful!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    willClose: () => {
                        window.location.href = '../customer file/customer.html';
                    }
                });
            } else {
                Swal.fire({
                    title: 'Login Failed',
                    text: 'Please check your username and password.',
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            }
        } else {
            // Handle Signup
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: sanitizedFullName,
                    username: sanitizedUsername,
                    password: sanitizedPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                playSound('success-sound');
                Swal.fire({
                    title: 'Welcome to Our Gym! 🎉',
                    text: 'Your account has been created successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    willClose: () => {
                        toggleForms();
                    }
                });
            } else {
                playSound('success-sound');
                Swal.fire({
                    title: 'Registration Failed',
                    text: data.error || 'Please try again with different information.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
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

    if (isLoginMode) {
        // Switch to signup
        formTitle.textContent = 'Create Account';
        formSubtitle.textContent = 'Join us and start your fitness journey';
        toggleText.textContent = 'Already have an account?';
        toggleButton.textContent = 'Sign in here';
        welcomeText.innerHTML = `
            <h1 class="text-4xl font-bold text-white mb-6">Hello, Friend!</h1>
            <p class="text-white/80 text-lg">Fill in your details and start your journey with us</p>
        `;
        fullNameField.classList.remove('hidden');
    } else {
        // Switch to login
        formTitle.textContent = 'Sign in to Account';
        formSubtitle.textContent = 'Start managing your fitness journey today';
        toggleText.textContent = "Don't have an account?";
        toggleButton.textContent = 'Sign up for free';
        welcomeText.innerHTML = `
            <h1 class="text-4xl font-bold text-white mb-6">Welcome</h1>
            <p class="text-white/80 text-lg">Enter your personal details and start your journey with us</p>
        `;
        fullNameField.classList.add('hidden');
    }

    // Clear form fields
    username.value = '';
    password.value = '';
    fullName.value = '';
}

// Add click event listener to toggle button
toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    toggleForms();
});

// Clear form fields on page load
window.addEventListener('load', function() {
    username.value = '';
    password.value = '';
    fullName.value = '';
});

// Get the show password button
const showPasswordButton = document.getElementById('showPassword');

// Add click event listener to the show password button
showPasswordButton.addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    // Toggle the eye icon
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});