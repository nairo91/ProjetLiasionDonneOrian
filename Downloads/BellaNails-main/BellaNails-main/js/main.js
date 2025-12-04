// Main JavaScript file for Bella Nails

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initMobileMenu();
    initSmoothScrolling();
    initAnimations();
    initLazyLoading();
    
    console.log('Bella Nails website loaded successfully!');
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isOpen = !mobileMenu.classList.contains('hidden');
            
            if (isOpen) {
                mobileMenu.classList.add('hidden');
                // Update button icon to hamburger
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                `;
            } else {
                mobileMenu.classList.remove('hidden');
                // Update button icon to X
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                `;
            }
        });
        
        // Close mobile menu when clicking on links
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                `;
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.innerHTML = `
                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    `;
                }
            }
        });
    }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && href !== '#') {
                e.preventDefault();
                
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Scroll Animations
 */
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.card-premium, .testimonial-card, .team-card, .gallery-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Header background on scroll
    const header = document.querySelector('nav');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('bg-white/95', 'backdrop-blur-sm');
            } else {
                header.classList.remove('bg-white/95', 'backdrop-blur-sm');
            }
        });
    }
}

/**
 * Lazy Loading for Images
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            imageObserver.observe(img);
        });
    }
}

/**
 * Form Utilities
 */
function showLoading(button) {
    if (button) {
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner mr-2"></div>
            Envoi en cours...
        `;
        
        // Store original content for restoration
        button.dataset.originalContent = originalContent;
    }
}

function hideLoading(button) {
    if (button && button.dataset.originalContent) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
    }
}

function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 success-message';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showErrorMessage(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 success-message';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Utility Functions
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        locale: 'fr-FR'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

/**
 * Performance Optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll events
const optimizedScrollHandler = throttle(function() {
    // Any scroll-based functionality
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

// Optimize resize events
const optimizedResizeHandler = debounce(function() {
    // Any resize-based functionality
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

/**
 * Accessibility Improvements
 */
function initA11y() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded z-50';
    skipLink.textContent = 'Passer au contenu principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation for mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.focus();
            }
        }
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initA11y);

/**
 * Error Handling
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    // In production, you might want to send this to an error tracking service
});

// Export functions for use in other files
window.BellaNails = {
    showLoading,
    hideLoading,
    showSuccessMessage,
    showErrorMessage,
    validateEmail,
    validatePhone,
    formatDate,
    debounce,
    throttle
};