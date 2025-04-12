// components.js
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                
                // Reattach event listeners for mobile menu
                const menuToggle = document.querySelector('.menu-toggle');
                if (menuToggle) {
                    menuToggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelector('nav.main-nav').classList.toggle('active');
                    });
                }
                
                // Highlight current page in nav
                const currentPage = window.location.pathname.split('/').pop();
                const navLinks = document.querySelectorAll('.nav-item');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPage || 
                        (currentPage === '' && href === 'index.html')) {
                        link.style.color = 'var(--primary)';
                        link.style.background = 'rgba(255, 87, 34, 0.08)';
                    }
                });
            })
            .catch(error => console.error('Error loading header:', error));
    }
    
    // Load footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(error => console.error('Error loading footer:', error));
    }
    
    // Load buy-me-tea button
    const teaContainer = document.getElementById('buy-me-tea-container');
    if (teaContainer) {
        fetch('components/buy-me-tea.html')
            .then(response => response.text())
            .then(data => {
                teaContainer.innerHTML = data;
                
                // Re-initialize the tea button functionality
                let clickListenerActive = false;
                
                // Make sure toggleBkashInfo is defined globally
                window.toggleBkashInfo = function() {
                    const info = document.getElementById('bkashInfo');
                    info.classList.toggle('show');
                    
                    if(info.classList.contains('show') && !clickListenerActive) {
                        document.addEventListener('click', closeOnClickOutside);
                        clickListenerActive = true;
                    } else {
                        document.removeEventListener('click', closeOnClickOutside);
                        clickListenerActive = false;
                    }
                };
                
                window.closeOnClickOutside = function(event) {
                    const info = document.getElementById('bkashInfo');
                    const button = document.querySelector('.coffee-button');
                    if (!info.contains(event.target) && !button.contains(event.target)) {
                        info.classList.remove('show');
                        document.removeEventListener('click', closeOnClickOutside);
                        clickListenerActive = false;
                    }
                };
                
                window.copyNumber = function(id) {
                    const number = document.getElementById(id).textContent.trim();
                    navigator.clipboard.writeText(number).then(() => {
                        const btn = document.querySelector(`#${id}`).nextElementSibling;
                        btn.textContent = 'কপি হয়েছে!';
                        setTimeout(() => btn.textContent = 'কপি করুন', 2000);
                    });
                };
            })
            .catch(error => console.error('Error loading buy-me-tea:', error));
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const nav = document.querySelector('nav.main-nav');
        if (nav && window.innerWidth <= 768 && 
            !event.target.closest('nav.main-nav') && 
            !event.target.closest('.menu-toggle')) {
            nav.classList.remove('active');
        }
    });
});
