// components.js
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('components/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load header: ${response.status}`);
                }
                return response.text();
            })
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
            .catch(error => {
                console.error('Error loading header:', error);
                headerContainer.innerHTML = `
                <header class="fireman-header">
                    <div class="header-content">
                        <div class="logo">
                            <i class="fas fa-fire"></i>
                            <span>Fireman</span>
                        </div>
                        <button class="menu-toggle" aria-label="Toggle menu">
                            <i class="fa fa-bars"></i>
                        </button>
                        <nav class="main-nav">
                            <a href="index.html" class="nav-item">Home</a>
                            <a href="about.html" class="nav-item">About</a>
                            <a href="contact.html" class="nav-item">Contact</a>
                        </nav>
                    </div>
                </header>`;
                // Reattach event listeners
                const menuToggle = document.querySelector('.menu-toggle');
                if (menuToggle) {
                    menuToggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelector('nav.main-nav').classList.toggle('active');
                    });
                }
            });
    }
    
    // Load footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load footer: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerContainer.innerHTML = `
                <footer class="fireman-footer">
                    <div class="footer-content">
                        <div class="footer-links">
                            <a href="about.html" class="footer-link">About</a>
                            <span class="footer-divider">•</span>
                            <a href="contact.html" class="footer-link">Contact</a>
                        </div>
                        <p style="opacity: 0.8; margin: 0;">
                            Developed by Tanvir Mahfuz • 2025<br>
                            A Learn with Tanvir Project
                        </p>
                    </div>
                </footer>`;
            });
    }
    
    // Load buy-me-tea button
    const teaContainer = document.getElementById('buy-me-tea-container');
    if (teaContainer) {
        fetch('components/buy-me-tea.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load buy-me-tea: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                teaContainer.innerHTML = data;
                
                // Re-initialize the tea button functionality
                // Define these functions in the global scope so they're accessible to the HTML
                window.toggleBkashInfo = function() {
                    const info = document.getElementById('bkashInfo');
                    info.classList.toggle('show');
                    
                    if(info.classList.contains('show')) {
                        // Prevent adding multiple listeners
                        document.removeEventListener('click', window.closeOnClickOutside);
                        document.addEventListener('click', window.closeOnClickOutside);
                    } else {
                        document.removeEventListener('click', window.closeOnClickOutside);
                    }
                };
                
                window.closeOnClickOutside = function(event) {
                    const info = document.getElementById('bkashInfo');
                    const button = document.querySelector('.coffee-button');
                    if (info && button && !info.contains(event.target) && !button.contains(event.target)) {
                        info.classList.remove('show');
                        document.removeEventListener('click', window.closeOnClickOutside);
                    }
                };
                
                window.copyNumber = function(id) {
                    const number = document.getElementById(id).textContent.trim();
                    navigator.clipboard.writeText(number).then(() => {
                        const btn = document.querySelector(`#${id}`).nextElementSibling;
                        if (btn) {
                            btn.textContent = 'কপি হয়েছে!';
                            setTimeout(() => btn.textContent = 'কপি করুন', 2000);
                        }
                    });
                };
            })
            .catch(error => {
                console.error('Error loading buy-me-tea:', error);
                teaContainer.innerHTML = `
                <div class="coffee-container">
                    <div class="coffee-button" onclick="toggleBkashInfo()">
                        <i class="fas fa-mug-hot"></i>
                        Buy me a দুধ চা
                    </div>
                    <div class="bkash-info" id="bkashInfo">
                        <button class="close-btn" onclick="toggleBkashInfo()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
                        <h3 style="margin-top: 0; color: var(--dark);">আরে আরে, থাক থাক, বেশি না। এক কাপ চা খাওয়াতে পারেন আমাকে।</h3>
                        <p style="font-size: 0.9rem;">এতগুলো পেইড সার্ভিস ফ্রি তে পাচ্ছেন, মাত্র ২০ টাকা দিয়ে এক কাপ দুধ চা তো খাওয়াতেই পারেন। 😄</p>
                        <div style="margin: 12px 0;">
                            <div class="payment-method bkash">
                                <strong>বিকাশ (পার্সোনাল):</strong> <span id="bkashNumber">+8801884581816</span>
                                <button class="copy-btn bkash" onclick="copyNumber('bkashNumber')">কপি করুন</button>
                            </div>
                            <div class="payment-method nagad">
                                <strong>নগদ (পার্সোনাল):</strong> <span id="nagadNumber">+8801884581816</span>
                                <button class="copy-btn nagad" onclick="copyNumber('nagadNumber')">কপি করুন</button>
                            </div>
                        </div>
                        <p style="font-size: 0.85rem; margin-bottom: 5px;">রেফারেন্স হিসেবে নিজের নাম add করতে পারেন।</p>
                        <p style="font-size: 0.85rem;">যারা দুধ চা খাওয়াবেন তারা অগ্রাধিকার পাবেন। যেকোনো কোর্স ম্যাটিরিয়াল, রিসোর্স ফাইল, এডুকেশনাল সার্ভিসের রিকুয়েস্ট জানাতে পারেন।</p>
                        <a href="https://wa.me/8801884581816" target="_blank" class="whatsapp-btn-small">
                            <i class="fab fa-whatsapp" style="margin-right: 5px;"></i> WhatsApp এ মেসেজ করুন
                        </a>
                    </div>
                </div>`;
                
                // Set up the functions for the fallback HTML
                window.toggleBkashInfo = function() {
                    const info = document.getElementById('bkashInfo');
                    info.classList.toggle('show');
                    
                    if(info.classList.contains('show')) {
                        document.removeEventListener('click', window.closeOnClickOutside);
                        document.addEventListener('click', window.closeOnClickOutside);
                    } else {
                        document.removeEventListener('click', window.closeOnClickOutside);
                    }
                };
                
                window.closeOnClickOutside = function(event) {
                    const info = document.getElementById('bkashInfo');
                    const button = document.querySelector('.coffee-button');
                    if (info && button && !info.contains(event.target) && !button.contains(event.target)) {
                        info.classList.remove('show');
                        document.removeEventListener('click', window.closeOnClickOutside);
                    }
                };
                
                window.copyNumber = function(id) {
                    const number = document.getElementById(id).textContent.trim();
                    navigator.clipboard.writeText(number).then(() => {
                        const btn = document.querySelector(`#${id}`).nextElementSibling;
                        if (btn) {
                            btn.textContent = 'কপি হয়েছে!';
                            setTimeout(() => btn.textContent = 'কপি করুন', 2000);
                        }
                    });
                };
            });
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
