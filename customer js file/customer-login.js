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
const API_URL = 'https://fitworx-backend.onrender.com'; // Updated to Render URL

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
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || (isLoginMode ? "Login Failed" : "Registration Failed"));
        }

        const data = await response.json();
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

    } catch (error) {
        console.error('API Error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMessage = "Couldn't connect to the server. Please check your internet connection.";
        }

        Toastify({
            text: errorMessage,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            stopOnFocus: true
        }).showToast();

        Swal.fire({
            title: 'Oops!',
            text: errorMessage,
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
        ? 'Join us and start your fitness journey'
        : 'Start your fitness journey today';

    // Update the toggle link text based on current mode
    toggleText.textContent = isLoginMode ? 'Already have an account?' : "Don't have an account?";
    toggleButton.textContent = isLoginMode ? 'Sign in here' : 'Sign up for free';

    // Update the welcome panel text
    welcomeText.innerHTML = isLoginMode
        ? `<div class="space-y-4">
                <div class="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Join Our Community
                </div>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight">
                    Hello,<br>
                    <span class="text-yellow-200">FRIEND!</span>
                </h1>
                <p class="text-white text-xl sm:text-2xl opacity-90 font-light max-w-lg">
                    Fill in your details and start your journey with us today.
                </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
                <div class="flex items-center space-x-3 text-white">
                    <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <i class="fas fa-user-plus text-white"></i>
                    </div>
                    <div>
                        <p class="font-semibold">Quick Registration</p>
                        <p class="text-sm opacity-75">Join in seconds</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3 text-white">
                    <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <i class="fas fa-gift text-white"></i>
                    </div>
                    <div>
                        <p class="font-semibold">Book now</p>
                        <p class="text-sm opacity-75">Start your journey</p>
                    </div>
                </div>
            </div>`
        : `<div class="space-y-4">
                <div class="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Premium Fitness Experience
                </div>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight">
                    WELCOME TO<br>
                    <span class="text-yellow-200">FITWORX</span>
                </h1>
                <p class="text-white text-xl sm:text-2xl opacity-90 font-light max-w-lg">
                    Transform your body, transform your life with our premium fitness experience.
                </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
                <div class="flex items-center space-x-3 text-white">
                    <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <i class="fas fa-dumbbell text-white"></i>
                    </div>
                    <div>
                        <p class="font-semibold">State-of-art Equipment</p>
                        <p class="text-sm opacity-75">Latest fitness technology</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3 text-white">
                    <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <i class="fas fa-users text-white"></i>
                    </div>
                    <div>
                        <p class="font-semibold">Expert Trainers</p>
                        <p class="text-sm opacity-75">Professional guidance</p>
                    </div>
                </div>
            </div>`;

    // Show fullName field in signup mode, hide in login mode
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

    // Toggle eye icon
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