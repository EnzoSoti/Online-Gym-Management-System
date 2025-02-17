const API_BASE_URL = 'http://localhost:3000/api';

document.getElementById('mobile-menu-button').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Dark mode toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference, otherwise use system preference
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

// Toggle theme
themeToggleBtn.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
});

// Toggle mobile submenu visibility
document.querySelectorAll('#mobile-menu button').forEach(button => {
    button.addEventListener('click', (e) => {
        const submenu = e.target.nextElementSibling;
        if (submenu) {
            submenu.classList.toggle('hidden');
        }
    });
});

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
    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(feedbackForm);
            const data = Object.fromEntries(formData.entries());

            // Here you would typically send this data to a backend server
            // For this example, we'll use SweetAlert to show a success message
            Swal.fire({
                title: 'Thank You!',
                text: 'Your feedback has been submitted successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Reset the form
            feedbackForm.reset();
        });
    }
    
    // Attach the event listener to the "Admin Login" button
    const adminLoginBtn = document.getElementById('admin-login-btn');
    adminLoginBtn.addEventListener('click', showAdminLogin);
    
});

async function showAdminLogin(e) {
    e.preventDefault();
    
    const modal = document.getElementById('adminLoginModal');
    const successModal = document.getElementById('successModal');
    const validationMessage = document.getElementById('validation-message');
    const loginBtn = document.getElementById('loginBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Handle Enter key press
    const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loginBtn.click();
        }
    };

    // Add Enter key listeners
    usernameInput.addEventListener('keypress', handleEnterKey);
    passwordInput.addEventListener('keypress', handleEnterKey);

    // Handle cancel button
    cancelBtn.onclick = () => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        validationMessage.classList.add('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        // Remove Enter key listeners when modal is closed
        usernameInput.removeEventListener('keypress', handleEnterKey);
        passwordInput.removeEventListener('keypress', handleEnterKey);
    };

    // Handle login button
    loginBtn.onclick = async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            validationMessage.textContent = 'All fields are required to proceed';
            validationMessage.classList.remove('hidden');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;

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
                
                // Hide login modal
                modal.classList.remove('flex');
                modal.classList.add('hidden');

                // Remove Enter key listeners before showing success modal
                usernameInput.removeEventListener('keypress', handleEnterKey);
                passwordInput.removeEventListener('keypress', handleEnterKey);

                // Show success modal
                successModal.classList.remove('hidden');
                successModal.classList.add('flex');

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = '../main/admin.html';
                }, 500);
            } else {
                validationMessage.textContent = data.error || 'Invalid credentials';
                validationMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Login error:', error);
            validationMessage.textContent = 'An error occurred during login';
            validationMessage.classList.remove('hidden');
        }

        // Reset button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" x2="3" y1="12" y2="12"></line>
            </svg>
            LET'S GO
        `;
    };
}