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
// window.addEventListener('load', function() {
//     Swal.fire({
//         width: '900px',
//         html: `
//             <style>
//                 @keyframes scaleIn {
//                     from { 
//                         opacity: 0; 
//                         transform: scale(0.95) translateX(-10px); 
//                     }
//                     to { 
//                         opacity: 1; 
//                         transform: scale(1) translateX(0); 
//                     }
//                 }

//                 .animate-scale-in {
//                     animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
//                 }

//                 .term-item {
//                     transition: all 0.3s ease;
//                 }

//                 .term-item:hover {
//                     background-color: rgba(255, 255, 255, 0.95);
//                     transform: translateX(5px);
//                 }

//                 .terms-grid {
//                     display: grid;
//                     grid-template-columns: repeat(2, 1fr);
//                     gap: 1rem;
//                 }
//             </style>
//             <div class="p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 rounded-xl shadow-xl">
//                 <h2 class="text-2xl font-bold mb-5 text-center text-orange-800 border-b border-orange-200 pb-3">Terms and Agreement</h2>

//                 <div class="terms-grid">
//                     <div class="space-y-3">
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.1s;">
//                             <i class="fas fa-dumbbell mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">No dropping dumbbells. Lower them carefully.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.2s;">
//                             <i class="fas fa-broom mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">Wipe down your equipment after use.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.3s;">
//                             <i class="fas fa-directions mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">Follow equipment instructions.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.4s;">
//                             <i class="fas fa-exclamation-triangle mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">Management not liable for injuries.</span>
//                         </div>
//                     </div>

//                     <div class="space-y-3">
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.5s;">
//                             <i class="fas fa-tshirt mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">Shirts and closed shoes required.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.6s;">
//                             <i class="fas fa-utensils mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">No food, drinks, or glass containers.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.7s;">
//                             <i class="fas fa-smoking-ban mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">No smoking.</span>
//                         </div>
//                         <div class="term-item bg-white/80 backdrop-blur-sm p-3 rounded-lg text-orange-900 flex items-center animate-scale-in shadow-sm" style="animation-delay: 0.8s;">
//                             <i class="fas fa-eye mr-3 text-lg text-orange-500"></i>
//                             <span class="font-medium">Watch your personal belongings.</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="mt-5 flex items-center justify-center bg-white/50 p-3 rounded-lg backdrop-blur-sm">
//                     <input 
//                         type="checkbox" 
//                         id="agreeCheckbox" 
//                         class="form-checkbox h-5 w-5 text-orange-500 rounded border-orange-300 focus:ring-orange-500 mr-3"
//                     >
//                     <label 
//                         for="agreeCheckbox" 
//                         class="text-sm text-orange-900 font-medium"
//                     >
//                         I agree to the terms and conditions
//                     </label>
//                 </div>
//             </div>
//         `,
//         icon: 'info',
//         confirmButtonText: 'Accept & Continue',
//         confirmButtonColor: '#f97316', // Orange-500
//         allowOutsideClick: false,
//         allowEscapeKey: false,
//         showClass: {
//             popup: 'animate__animated animate__fadeInRight animate__faster'
//         },
//         hideClass: {
//             popup: 'animate__animated animate__fadeOutRight animate__faster'
//         },
//         preConfirm: () => {
//             const agreeCheckbox = Swal.getPopup().querySelector('#agreeCheckbox');
//             if (!agreeCheckbox.checked) {
//                 Swal.showValidationMessage('You must agree to the terms to proceed');
//             }
//             return agreeCheckbox.checked;
//         },
//         willClose: () => {
//             if (typeof formSection !== 'undefined') {
//                 formSection.classList.remove('hidden');
//             }
//         }
//     });
// });

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