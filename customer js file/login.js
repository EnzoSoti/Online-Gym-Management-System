// Get DOM elements
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const toggleText = document.getElementById('toggleText');
const toggleButton = document.getElementById('toggleForm');
const welcomeText = document.getElementById('welcomeText');

// Static credentials
const VALID_USERNAME = "user";
const VALID_PASSWORD = "user";

// Handle login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (username.value === VALID_USERNAME && password.value === VALID_PASSWORD) {
        // Successful login
        Swal.fire({
            title: 'Success!',
            text: 'Login successful! Welcome back.',
            icon: 'success',
            confirmButtonText: 'Continue',
            confirmButtonColor: '#f97316' // Orange-500 color
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to customer.html after successful login
                window.location.href = '../customer file/customer.html';
            }
        });
    } else {
        // Failed login
        Swal.fire({
            title: 'Error!',
            text: 'Invalid username or password',
            icon: 'error',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#f97316' // Orange-500 color
        });
    }
});

// Toggle between login and signup forms
function toggleForms() {
    const signupForm = document.getElementById('signupForm');
    
    if (formTitle.textContent === 'Sign in to Account') {
        // Show signup form
        formTitle.textContent = 'Create Account';
        formSubtitle.textContent = 'Join us and start your fitness journey';
        toggleText.textContent = 'Already have an account?';
        toggleButton.textContent = 'Sign in here';
        welcomeText.innerHTML = `
            <h1 class="text-4xl font-bold text-white mb-6">Hello, Friend!</h1>
            <p class="text-white/80 text-lg">Fill in your details and start your journey with us</p>
        `;
    } else {
        // Show login form
        formTitle.textContent = 'Sign in to Account';
        formSubtitle.textContent = 'Start managing your fitness journey today';
        toggleText.textContent = "Don't have an account?";
        toggleButton.textContent = 'Sign up for free';
        welcomeText.innerHTML = `
            <h1 class="text-4xl font-bold text-white mb-6">Welcome Back!</h1>
            <p class="text-white/80 text-lg">Enter your personal details and start your journey with us</p>
        `;
    }
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
});

// Prevent form submission for social login buttons
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Info',
            text: 'Social login is not implemented in this demo',
            icon: 'info',
            confirmButtonColor: '#f97316'
        });
    });
});