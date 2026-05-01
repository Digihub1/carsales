// script.js - unified lowercase script
// Mobile menu toggle, dropdown ARIA, keyboard support, lazy-loading helper

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navMenu = document.querySelector('.nav-list');

    // Ensure elements exist
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.setAttribute('role', 'button');
        mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');

        mobileMenuBtn.addEventListener('click', () => {
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
            mainNav.classList.toggle('open');
            // Toggle focusability for links on mobile
            if (navMenu) {
                if (mainNav.classList.contains('open')) {
                    navMenu.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '0'));
                } else {
                    navMenu.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
                }
            }
        });

        // allow Enter/Space to toggle
        mobileMenuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                mobileMenuBtn.click();
            }
        });
    }

    // Dropdown ARIA and keyboard support
    document.querySelectorAll('.dropdown').forEach(drop => {
        const trigger = drop.querySelector('a');
        const menu = drop.querySelector('.dropdown-content');
        if (!trigger || !menu) return;

        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('role', 'button');
        menu.setAttribute('role', 'menu');
        menu.querySelectorAll('a').forEach(item => item.setAttribute('role', 'menuitem'));

        // Toggle on click
        trigger.addEventListener('click', (e) => {
            // on pages where the link is a real navigation, allow default if modifier pressed
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('open');
        });

        // Keyboard: Enter or Space opens, Escape closes
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            } else if (e.key === 'Escape') {
                trigger.setAttribute('aria-expanded', 'false');
                menu.classList.remove('open');
                trigger.focus();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!drop.contains(e.target)) {
                trigger.setAttribute('aria-expanded', 'false');
                menu.classList.remove('open');
            }
        });
    });

    // Lazy-load images: add loading="lazy" to images that look non-critical
    document.querySelectorAll('img').forEach(img => {
        // skip if already set or images in hero (keep hero eager)
        if (!img.hasAttribute('loading') && !img.closest('.hero')) {
            img.setAttribute('loading', 'lazy');
        }
    });

    // Make sure nav links are reachable on mobile when JS runs
    if (navMenu) {
        const inMobile = window.innerWidth <= 720;
        navMenu.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', inMobile ? '-1' : '0'));
    }

    // Close mobile nav on resize to larger screens
    window.addEventListener('resize', () => {
        if (window.innerWidth > 720) {
            mainNav.classList.remove('open');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navMenu.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '0'));
        } else {
            navMenu.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
        }
    });
});

// small helper for contrast suggestions (no DOM changes) - logs potential low contrast elements
// This is a lightweight runtime helper that can be removed in production.
(function contrastAudit(){
    try{
        const getColor = el => window.getComputedStyle(el).color;
        const sampleEls = document.querySelectorAll('body *');
        // basic check for footer links (light on dark)
        document.querySelectorAll('.footer a, .top-bar a').forEach(a => {
            const color = getColor(a);
            if (color) console.debug('[contrast-audit] element', a, 'color', color);
        });
    }catch(e){/* silent */}
})();

// --- A/B test for primary CTA ---
(function ABTestCTA(){
    try{
        const STORAGE_KEY = 'motorhub_cta_variant';
        const VARIANTS = { A: 'FIND A CAR', B: 'SEE PRICES' };
        let variant = localStorage.getItem(STORAGE_KEY);
        if (!variant) {
            // assign randomly and persist
            variant = Math.random() < 0.5 ? 'A' : 'B';
            localStorage.setItem(STORAGE_KEY, variant);
        }

        const primary = document.querySelector('.hero-btn--primary');
        if (primary) {
            // apply text variant
            const span = primary.querySelector('span');
            if (span) span.textContent = VARIANTS[variant];

            // log clicks
            primary.addEventListener('click', (e) => {
                const payload = { event: 'cta_click', variant, timestamp: Date.now(), href: primary.getAttribute('href') };
                console.info('A/B CTA click', payload);
                // store counts locally
                const counts = JSON.parse(localStorage.getItem('motorhub_cta_counts') || '{}');
                counts[variant] = (counts[variant] || 0) + 1;
                localStorage.setItem('motorhub_cta_counts', JSON.stringify(counts));
            });
        }
    }catch(e){console.warn('ABTestCTA error', e)}
})();
// Quick load check
console.log('Script.js loaded');

// Search Tabs
const searchTabs = document.querySelectorAll('.search-tab');
const searchCategoryInput = document.getElementById('search-category');
if (searchTabs.length) {
    searchTabs.forEach(tab => {
        // ensure ARIA attributes are present
        if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
        const isActive = tab.classList.contains('active');
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');

        tab.addEventListener('click', (e) => {
            // toggle active class and aria-selected on all tabs
            searchTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // sync hidden input for form submission
            const tabVal = tab.getAttribute('data-tab');
            if (searchCategoryInput && tabVal) {
                searchCategoryInput.value = tabVal;
            }

            // move focus into the form for keyboard users
            const form = document.querySelector('.search-form');
            if (form) {
                const firstControl = form.querySelector('select, input, button');
                if (firstControl) firstControl.focus();
            }
        });

        // keyboard: activate with Enter or Space
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });
    // initialize hidden input from any pre-selected/active tab
    const activeTab = Array.from(searchTabs).find(t => t.classList.contains('active')) || searchTabs[0];
    if (activeTab && searchCategoryInput) {
        const val = activeTab.getAttribute('data-tab');
        if (val) searchCategoryInput.value = val;
    }
}

// Filter Functionality for Cars Page
if (document.getElementById('stock-type')) {
    const stockFilter = document.getElementById('stock-type');
    const makeFilter = document.getElementById('make-filter');
    const modelFilter = document.getElementById('model-filter');
    const priceFilter = document.getElementById('price-filter');
    const yearFilter = document.getElementById('year-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Sample vehicle data
    const vehicles = [
        {
            id: 1,
            make: 'lexus',
            model: 'LX570',
            year: 2023,
            price: 95000,
            stock: 'instock',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            title: 'Lexus LX570',
            specs: { year: 2023, mileage: '8,500 km', fuel: 'Petrol' }
        },
        {
            id: 2,
            make: 'toyota',
            model: 'Land Cruiser',
            year: 2024,
            price: 88000,
            stock: 'instock',
            image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            title: 'Toyota Land Cruiser V8',
            specs: { year: 2024, mileage: '2,500 km', fuel: 'Diesel' }
        },
        {
            id: 3,
            make: 'mercedes',
            model: 'GLE',
            year: 2023,
            price: 78500,
            stock: 'instock',
            image: 'https://images.unsplash.com/photo-1563720223485-884b664e4eb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            title: 'Mercedes-Benz GLE',
            specs: { year: 2023, mileage: '12,000 km', fuel: 'Petrol' }
        },
        {
            id: 4,
            make: 'bmw',
            model: 'X5',
            year: 2023,
            price: 82000,
            stock: 'upcoming',
            image: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            title: 'BMW X5 M Sport',
            specs: { year: 2023, mileage: '9,800 km', fuel: 'Petrol' }
        }
    ];

    // Model options based on make
    makeFilter.addEventListener('change', function() {
        const make = this.value;
        modelFilter.innerHTML = '<option value="all">All Models</option>';
        
        if (make !== 'all') {
            const models = [...new Set(vehicles.filter(v => v.make === make).map(v => v.model))];
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.toLowerCase();
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        }
    });

    // Apply filters
    applyFiltersBtn.addEventListener('click', filterVehicles);
    resetFiltersBtn.addEventListener('click', resetFilters);

    function filterVehicles() {
        const stockValue = stockFilter.value;
        const makeValue = makeFilter.value;
        const modelValue = modelFilter.value;
        const priceValue = priceFilter.value;
        const yearValue = yearFilter.value;

        const filteredVehicles = vehicles.filter(vehicle => {
            const stockMatch = stockValue === 'all' || vehicle.stock === stockValue;
            const makeMatch = makeValue === 'all' || vehicle.make === makeValue;
            const modelMatch = modelValue === 'all' || vehicle.model === modelValue;
            const yearMatch = yearValue === 'all' || vehicle.year === parseInt(yearValue);
            
            let priceMatch = true;
            if (priceValue !== 'all') {
                if (priceValue === '0-50000') priceMatch = vehicle.price < 50000;
                else if (priceValue === '50000-100000') priceMatch = vehicle.price >= 50000 && vehicle.price <= 100000;
                else if (priceValue === '100000-150000') priceMatch = vehicle.price >= 100000 && vehicle.price <= 150000;
                else if (priceValue === '150000+') priceMatch = vehicle.price > 150000;
            }

            return stockMatch && makeMatch && modelMatch && yearMatch && priceMatch;
        });

        displayVehicles(filteredVehicles);
    }

    function resetFilters() {
        stockFilter.value = 'all';
        makeFilter.value = 'all';
        modelFilter.innerHTML = '<option value="all">All Models</option>';
        priceFilter.value = 'all';
        yearFilter.value = 'all';
        filterVehicles();
    }

    function displayVehicles(vehiclesArray) {
        const inventoryGrid = document.querySelector('.inventory-grid');
        inventoryGrid.innerHTML = '';

        if (vehiclesArray.length === 0) {
            inventoryGrid.innerHTML = '<div class="no-results"><h3>No vehicles found matching your criteria</h3></div>';
            return;
        }

        vehiclesArray.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card';
            vehicleCard.innerHTML = `
                <div class="vehicle-image">
                    <img src="${vehicle.image}" alt="${vehicle.title}">
                    <div class="vehicle-badge">${vehicle.stock === 'instock' ? 'In Stock' : 'Coming Soon'}</div>
                </div>
                <div class="vehicle-info">
                    <h3>${vehicle.title}</h3>
                    <div class="vehicle-specs">
                        <span><i class="fas fa-calendar"></i> ${vehicle.specs.year}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${vehicle.specs.mileage}</span>
                        <span><i class="fas fa-gas-pump"></i> ${vehicle.specs.fuel}</span>
                    </div>
                    <div class="vehicle-price">
                        <span class="price">$${vehicle.price.toLocaleString()}</span>
                        <button class="inquiry-btn">Make Inquiry</button>
                    </div>
                </div>
            `;
            inventoryGrid.appendChild(vehicleCard);
        });

        // Add event listeners to new inquiry buttons
        document.querySelectorAll('.inquiry-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const vehicleName = this.closest('.vehicle-card').querySelector('h3').textContent;
                alert(`Thank you for your interest in the ${vehicleName}! Our sales team will contact you shortly.`);
            });
        });
    }

    // Initial display
    displayVehicles(vehicles);
}

// Inquiry Buttons
document.querySelectorAll('.inquiry-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const vehicleName = this.closest('.vehicle-card').querySelector('h3').textContent;
        alert(`Thank you for your interest in the ${vehicleName}! Our sales team will contact you shortly.`);
    });
});


// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close mobile menu when clicking on a link (freshly query to avoid stale references)
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            const _mainNav = document.querySelector('.main-nav');
            const _mobileToggle = document.querySelector('.mobile-toggle');
            if (_mainNav) _mainNav.classList.remove('open');
            if (_mobileToggle) _mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
});


// Cookies Settings guard
const cookiesBtn = document.getElementById('cookies-settings');
if (cookiesBtn) {
    cookiesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Cookies settings would be displayed here.');
    });
}