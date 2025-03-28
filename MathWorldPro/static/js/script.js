/**
 * Mathematical World - Main JavaScript
 * Handles general site interactivity and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initializeTooltips();
    
    // Add smooth scrolling to all links
    addSmoothScrolling();
    
    // Add animation to elements when they come into view
    addScrollAnimations();
    
    // Add active class to current navigation item
    highlightCurrentNavItem();
    
    // Initialize MathJax for rendering mathematical expressions
    initializeMathJax();
    
    // Add hover effects for buttons and cards
    addHoverEffects();
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Add smooth scrolling to all links
 */
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Add animations to elements when they come into view
 */
function addScrollAnimations() {
    // Add animation classes when elements come into view
    const animateElements = document.querySelectorAll('.topic-card, .feature-item, .game-card');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scale-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Observe each element
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Highlight the current navigation item based on URL
 */
function highlightCurrentNavItem() {
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else if (currentPath === '/' && linkPath === '/') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize MathJax for rendering mathematical expressions
 */
function initializeMathJax() {
    if (typeof MathJax !== 'undefined') {
        // Para MathJax versión 3
        if (typeof MathJax.typeset === 'function') {
            MathJax.typeset();
        } 
        // Para compatibilidad con MathJax versión 2 (fallback)
        else if (MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    }
}

/**
 * Add hover effects for interactive elements
 */
function addHoverEffects() {
    // Add hover effect for topic cards
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('glow');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('glow');
        });
    });
    
    // Add hover effect for nav links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.classList.add('bounce');
            }
        });
        
        link.addEventListener('mouseleave', function() {
            this.classList.remove('bounce');
        });
        
        link.addEventListener('animationend', function() {
            this.classList.remove('bounce');
        });
    });
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar-collapse');
    if (navbar.classList.contains('show')) {
        navbar.classList.remove('show');
    } else {
        navbar.classList.add('show');
    }
}

/**
 * Scroll to top of the page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
