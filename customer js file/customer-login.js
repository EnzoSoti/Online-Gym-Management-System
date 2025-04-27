// ========== DOM Elements ==========
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

// ========== Configuration ==========
const API_URL = 'http://localhost:3000/api';

// ========== Utility Functions ==========

// Sanitize input to prevent XSS attacks
const sanitizeInput = (input) => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Play sound from DOM audio element
const playSound = (soundId) => {
    const sound = document.getElementById(soundId);
    sound.play();
};

// ========== Form Submission Handler ==========
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
        playSound('success-sound'); // Optional: swap to an error sound for better UX
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

// ========== Toggle Form View ==========
function toggleForms() {
    // Check current form mode based on the header text
    const isLoginMode = formTitle.textContent === 'Sign in to Account';

    // Toggle the form title and subtitle based on current mode
    formTitle.textContent = isLoginMode ? 'Create Account' : 'Sign in to Account';
    formSubtitle.textContent = isLoginMode
        ? 'Join us and start your fitness journey'  // Text for signup mode
        : 'Start managing your fitness journey today';  // Text for login mode

    // Update the toggle link text based on current mode
    toggleText.textContent = isLoginMode ? 'Already have an account?' : "Don't have an account?";
    toggleButton.textContent = isLoginMode ? 'Sign in here' : 'Sign up for free';

    // Update the welcome panel text based on current mode
    welcomeText.innerHTML = isLoginMode
        ? `<h1 class="text-4xl font-bold text-white mb-6">Hello, Friend!</h1>
           <p class="text-white/80 text-lg">Fill in your details and start your journey with us</p>`
        : `<h1 class="text-4xl font-bold text-white mb-6">Welcome</h1>
           <p class="text-white/80 text-lg">Enter your personal details and start your journey with us</p>`;

    // FIXED: Show fullName field in signup mode, hide in login mode
    // The issue was here - we needed to invert the logic
    // When isLoginMode is true, we want fullNameField to be hidden
    // When isLoginMode is false (signup mode), we want fullNameField to be visible
    fullNameField.classList.toggle('hidden', !isLoginMode);

    // Reset all form fields when toggling between forms
    username.value = '';
    password.value = '';
    fullName.value = '';
}

// ========== Password Visibility Toggle ==========
showPasswordButton.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    // Toggle eye icon (FontAwesome assumed)
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// ========== Event Listeners ==========

// Switch between login/signup on toggle button click
toggleButton.addEventListener('click', function (e) {
    e.preventDefault();
    toggleForms();
});

// Clear all input fields on initial load
window.addEventListener('load', function () {
    username.value = '';
    password.value = '';
    fullName.value = '';
});
