document.addEventListener('DOMContentLoaded', (event) => {
    const mainContent = document.querySelector('.main-content');
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;
    let isScrolling = false;

    function scrollToSection(index) {
        if (index >= 0 && index < sections.length) {
            isScrolling = true;
            sections[index].scrollIntoView({ behavior: 'smooth' });
            currentSectionIndex = index;
            setTimeout(() => {
                isScrolling = false;
            }, 1000); // Adjust this value based on your transition duration
        }
    }

    mainContent.addEventListener('wheel', (e) => {
        if (!isScrolling) {
            if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
                // Scrolling down
                scrollToSection(currentSectionIndex + 1);
            } else if (e.deltaY < 0 && currentSectionIndex > 0) {
                // Scrolling up
                scrollToSection(currentSectionIndex - 1);
            }
        }
        e.preventDefault();
    }, { passive: false });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isScrolling) {
            if (e.key === 'ArrowDown' && currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            } else if (e.key === 'ArrowUp' && currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
        }
    });
});