document.addEventListener('DOMContentLoaded', (event) => {
    const mainContent = document.querySelector('.main-content');
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;
    let isScrolling = false;

    function isInDashboardSection(element) {
        // Check if the element or its parents have id="dashboard"
        let current = element;
        while (current) {
            if (current.id === 'dashboard') {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    function isInDashboardScrollableArea(target) {
        // Check if we're in a scrollable area within the dashboard
        const scrollableElements = [
            '.monthly-due-section',
            '.max-h-[400px]'
        ];
        
        return scrollableElements.some(selector => {
            const element = target.closest(selector);
            return element && element.scrollHeight > element.clientHeight;
        });
    }

    function scrollToSection(index) {
        if (index >= 0 && index < sections.length) {
            isScrolling = true;
            sections[index].scrollIntoView({ behavior: 'smooth' });
            currentSectionIndex = index;
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }

    mainContent.addEventListener('wheel', (e) => {
        // Check if we're in the dashboard section and in a scrollable area
        if (isInDashboardSection(e.target) && isInDashboardScrollableArea(e.target)) {
            // Allow natural scrolling in dashboard scrollable areas
            e.stopPropagation();
            return;
        }

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
        // Don't intercept keyboard events when user is focused on a scrollable area
        if (isInDashboardSection(document.activeElement) && isInDashboardScrollableArea(document.activeElement)) {
            return;
        }

        if (!isScrolling) {
            if (e.key === 'ArrowDown' && currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
                e.preventDefault();
            } else if (e.key === 'ArrowUp' && currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
                e.preventDefault();
            }
        }
    });

    // Add touch support
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        // Allow natural touch scrolling in dashboard scrollable areas
        if (isInDashboardSection(e.target) && isInDashboardScrollableArea(e.target)) {
            return;
        }
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (isInDashboardSection(e.target) && isInDashboardScrollableArea(e.target)) {
            return;
        }

        touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (!isScrolling) {
            if (deltaY > 50 && currentSectionIndex < sections.length - 1) {
                // Swipe up
                scrollToSection(currentSectionIndex + 1);
            } else if (deltaY < -50 && currentSectionIndex > 0) {
                // Swipe down
                scrollToSection(currentSectionIndex - 1);
            }
        }
    }, { passive: true });
});