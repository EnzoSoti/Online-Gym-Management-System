const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('carousel');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    let currentIndex = 0;

    function showSlide(index) {
        // Hide all slides
        carouselItems.forEach(item => item.classList.remove('active'));
        
        // Ensure index wraps around
        currentIndex = (index + carouselItems.length) % carouselItems.length;
        
        // Show current slide
        carouselItems[currentIndex].classList.add('active');
    }

    // Auto-advance slides every 3 seconds
    setInterval(() => {
        showSlide(currentIndex + 1);
    }, 3000); // Increased to 3 seconds for better readability

    // Section visibility tracking
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // FAQ Accordion Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');

        question.addEventListener('click', () => {
            // Toggle answer visibility
            answer.classList.toggle('hidden');
            
            // Rotate icon
            icon.classList.toggle('rotate-180');
        });
    });

    // Attach the event listener to the "Admin Login" button
    const adminLoginBtn = document.getElementById('admin-login-btn');
    adminLoginBtn.addEventListener('click', showAdminLogin);
});

async function showAdminLogin(e) {
    e.preventDefault();

    const { value: formValues } = await Swal.fire({
        title: '<div class="flex flex-col items-center gap-3">' +
               '<div class="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">' +
               '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
               '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>' +
               '</svg></div>' +
               '<h2 class="text-2xl font-bold text-orange-800">Admin Login</h2>' +
               '</div>',

        html: `
            <div class="space-y-6 pt-4">
                <div class="space-y-5">
                    <div class="group">
                        <label class="block text-orange-700 text-sm mb-2 ml-1 text-left font-semibold">Username</label>
                        <div class="relative">
                            <input type="text" 
                                id="admin-username" 
                                class="w-full px-5 py-3 rounded-lg bg-white text-gray-800
                                        border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all duration-300"
                                placeholder="Enter your username">
                        </div>
                    </div>
                    <div class="group">
                        <label class="block text-orange-700 text-sm mb-2 ml-1 text-left font-semibold">Password</label>
                        <div class="relative">
                            <input type="password" 
                                id="admin-password" 
                                class="w-full px-5 py-3 rounded-lg bg-white text-gray-800
                                        border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all duration-300"
                                placeholder="Enter your password">
                        </div>
                    </div>
                </div>
            </div>
        `,

        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        customClass: {
            container: 'Poppins',
            popup: 'rounded-xl bg-white border border-orange-100 shadow-2xl',
            title: 'text-center border-b border-orange-100 pb-4',
            htmlContainer: 'px-6',
            confirmButton: 'w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg px-4 py-3 uppercase tracking-wide transition-colors duration-300',
            cancelButton: 'w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg px-4 py-3 uppercase tracking-wide transition-colors duration-300',
            actions: 'grid grid-cols-2 gap-4 px-6 pb-6 pt-6',
            validationMessage: 'bg-red-50 text-red-600 rounded-lg py-3 px-4 mt-3 text-sm font-medium border border-red-200'
        },

        buttonsStyling: false,
        showLoaderOnConfirm: true,

        preConfirm: async () => {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            if (!username || !password) {
                Swal.showValidationMessage('All fields are required to proceed');
                return false;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store the full name in sessionStorage
                    sessionStorage.setItem('admin_full_name', data.admin.full_name);
                    return true;
                } else {
                    Swal.showValidationMessage(data.error || 'Invalid credentials');
                    return false;
                }
            } catch (error) {
                console.error('Login error:', error);
                Swal.showValidationMessage('An error occurred during login');
                return false;
            }
        }
    });

    if (formValues) {
        Swal.fire({
            html: `
                <div class="flex flex-col items-center gap-4 py-8">
                    <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800">Access Granted</h3>
                </div>
            `,
            showConfirmButton: false,
            timer: 500,
            customClass: {
                popup: 'rounded-xl bg-white border border-green-100 shadow-xl'
            }
        }).then(() => {
            window.location.href = '../main/admin.html';
        });
    }
}