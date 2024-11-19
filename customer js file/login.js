// Get DOM elements
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const toggleText = document.getElementById('toggleText');
const toggleButton = document.getElementById('toggleForm');
const welcomeText = document.getElementById('welcomeText');
const formSection = document.getElementById('formSection');

// Static credentials
const VALID_USERNAME = "user";
const VALID_PASSWORD = "user";

// Show terms and conditions popup on page load
window.addEventListener('load', function() {
    Swal.fire({
        title: 'Terms and Conditions',
        html: `
            <p class="font-bold">HOUSE RULES:</p>
            <p class="font-bold">FRIENDLY REMINDERS TO ALL OUR MEMBERS and PATRONS</p>
            <ol class="list-decimal list-inside">
                <li>No dropping of Dumbbells. If you lift them, you lower them.</li>
                <li>It's your sweat, wipe it off.</li>
                <li>Use equipment directions carefully.</li>
                <li>Management assumes no responsibility for any injury that may occur.</li>
                <li>Please follow equipment directions.</li>
                <li>SHIRTS AND SHOES MUST BE WORN AT ALL TIMES. NO SANDALS OR FLIP FLOPS PLEASE.</li>
                <li>No bringing in of Food, Alcohol, Glass.</li>
                <li>No Smoking.</li>
                <li>Please be watchful of your belongings.</li>
            </ol>
            <p class="mt-4">Fitworx.com</p>
            <div class="flex items-center mt-4">
                <input type="checkbox" id="agreeCheckbox" class="mr-2">
                <label for="agreeCheckbox" class="text-gray-600">I understand and agree to the terms and conditions</label>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Proceed',
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: () => {
            const agreeCheckbox = Swal.getPopup().querySelector('#agreeCheckbox');
            if (!agreeCheckbox.checked) {
                Swal.showValidationMessage('You must agree to the terms and conditions');
            }
            return agreeCheckbox.checked;
        },
        willClose: () => {
            formSection.classList.remove('hidden');
        }
    });
});

// Handle login form submission
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (username.value === VALID_USERNAME && password.value === VALID_PASSWORD) {
        // Successful login
        Swal.fire({
            title: '🎉 Success!',
            text: 'Welcome back!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000,
            background: '#f0fdf4', // Light green background
            iconColor: '#22c55e', // Green-500 color
            color: '#064e3b', // Dark green text color
            willClose: () => {
                window.location.href = '../customer file/customer.html';
            }
        });
    } else {
        // Failed login
        Swal.fire({
            title: '⚠️ Error!',
            text: 'Invalid username or password.',
            icon: 'error',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#ef4444', // Red-500 color
            background: '#fef2f2', // Light red background
            iconColor: '#b91c1c', // Dark red color
            color: '#7f1d1d' // Darker red text color
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