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

// API URL - Update this with your server URL
const API_URL = 'http://localhost:3000/api';

// User-friendly validation messages
const USER_MESSAGES = {
    password: {
        requirements: "Your password must have:",
        minLength: "• At least 8 characters",
        uppercase: "• One capital letter",
        lowercase: "• One small letter",
        number: "• One number",
        special: "• One special character (!@#$%^&*)"
    },
    username: {
        requirements: "Username must be:",
        format: "• 3-30 characters long",
        allowed: "• Can use letters, numbers, dots, and dashes"
    },
    fullName: {
        requirements: "Please enter your real name:",
        format: "• First and last name",
        allowed: "• Letters, spaces, and hyphens only"
    },
    throttle: {
        tooMany: "Too many attempts. Please try again in 5 minutes.",
        tooFast: "Please wait a moment before trying again."
    }
};

// Throttling configuration
const THROTTLE_CONFIG = {
    maxAttempts: 5,
    timeWindow: 5 * 60 * 1000, // 5 minutes
    attempts: new Map(),
    lastSubmitTime: 0,
    minSubmitInterval: 1000 // Minimum 1 second between submissions
};

// Validation functions
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push(USER_MESSAGES.password.minLength);
    }
    if (!/[A-Z]/.test(password)) {
        errors.push(USER_MESSAGES.password.uppercase);
    }
    if (!/[a-z]/.test(password)) {
        errors.push(USER_MESSAGES.password.lowercase);
    }
    if (!/\d/.test(password)) {
        errors.push(USER_MESSAGES.password.number);
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        errors.push(USER_MESSAGES.password.special);
    }
    return errors;
};

const validateUsername = (username) => {
    const errors = [];
    if (username.length < 3 || username.length > 30) {
        errors.push(USER_MESSAGES.username.format);
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        errors.push(USER_MESSAGES.username.allowed);
    }
    return errors;
};

const validateFullName = (fullName) => {
    const errors = [];
    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
        errors.push(USER_MESSAGES.fullName.allowed);
    }
    if (fullName.length < 2) {
        errors.push(USER_MESSAGES.fullName.format);
    }
    return errors;
};

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

// Check if the form submission is being throttled
const isThrottled = (clientIP = 'default') => {
    const now = Date.now();
    const attempts = THROTTLE_CONFIG.attempts.get(clientIP) || [];
    
    // Clean up old attempts
    const recentAttempts = attempts.filter(time => now - time < THROTTLE_CONFIG.timeWindow);
    THROTTLE_CONFIG.attempts.set(clientIP, recentAttempts);

    // Check submission interval
    if (now - THROTTLE_CONFIG.lastSubmitTime < THROTTLE_CONFIG.minSubmitInterval) {
        return true;
    }

    // Check number of attempts
    return recentAttempts.length >= THROTTLE_CONFIG.maxAttempts;
};

// Show validation errors in a user-friendly way
const showValidationErrors = (errors, type) => {
    Swal.fire({
        title: `Please Check Your ${type}`,
        html: `
            <div class="text-left">
                <p>${USER_MESSAGES[type].requirements}</p>
                ${errors.join('<br>')}
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#3b82f6',
        background: '#f0f9ff',
        iconColor: '#0ea5e9',
        color: '#0c4a6e'
    });
};

// Handle form submission
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isThrottled()) {
        Swal.fire({
            title: 'Please Wait',
            text: USER_MESSAGES.throttle.tooMany,
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#eab308',
            background: '#fefce8',
            iconColor: '#ca8a04',
            color: '#854d0e'
        });
        return;
    }

    const isLoginMode = formTitle.textContent === 'Sign in to Account';

    // Validate and sanitize inputs
    const sanitizedUsername = sanitizeInput(username.value.trim());
    const sanitizedPassword = password.value; // Don't sanitize password
    const sanitizedFullName = isLoginMode ? '' : sanitizeInput(fullName.value.trim());

    // Validate inputs
    const usernameErrors = validateUsername(sanitizedUsername);
    if (usernameErrors.length > 0) {
        showValidationErrors(usernameErrors, 'username');
        return;
    }

    const passwordErrors = validatePassword(sanitizedPassword);
    if (passwordErrors.length > 0) {
        showValidationErrors(passwordErrors, 'password');
        return;
    }

    if (!isLoginMode) {
        const fullNameErrors = validateFullName(sanitizedFullName);
        if (fullNameErrors.length > 0) {
            showValidationErrors(fullNameErrors, 'fullName');
            return;
        }
    }

    try {
        // Update throttling data
        const clientIP = 'default'; // In real implementation, get client IP
        const attempts = THROTTLE_CONFIG.attempts.get(clientIP) || [];
        attempts.push(Date.now());
        THROTTLE_CONFIG.attempts.set(clientIP, attempts);
        THROTTLE_CONFIG.lastSubmitTime = Date.now();

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
                Swal.fire({
                    title: '🎉 Welcome Back!',
                    text: 'Login successful!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#f0fdf4',
                    iconColor: '#22c55e',
                    color: '#064e3b',
                    willClose: () => {
                        window.location.href = '../customer file/customer.html';
                    }
                });
            } else {
                Swal.fire({
                    title: 'Login Failed',
                    text: 'Please check your username and password.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                    confirmButtonColor: '#ef4444',
                    background: '#fef2f2',
                    iconColor: '#b91c1c',
                    color: '#7f1d1d'
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
                Swal.fire({
                    title: '🎉 Welcome!',
                    text: 'Your account has been created successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#f0fdf4',
                    iconColor: '#22c55e',
                    color: '#064e3b',
                    willClose: () => {
                        toggleForms();
                    }
                });
            } else {
                Swal.fire({
                    title: 'Registration Failed',
                    text: data.error || 'Please try again with different information.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ef4444',
                    background: '#fef2f2',
                    iconColor: '#b91c1c',
                    color: '#7f1d1d'
                });
            }
        }
    } catch (error) {
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
            <h1 class="text-4xl font-bold text-white mb-6">Welcome Back!</h1>
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