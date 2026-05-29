document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    }

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', toggleMenu);
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('open')) {
                    toggleMenu();
                }
            });
        });
    }

    /* ==========================================================================
       BEFORE-AFTER SLIDER (MOUSE & TOUCH DRAG)
       ========================================================================== */
    const sliderContainer = document.getElementById('ba-slider');
    const afterImageWrap = document.getElementById('after-img-wrap');
    const sliderHandle = document.getElementById('slider-handle-bar');

    if (sliderContainer && afterImageWrap && sliderHandle) {
        let isDragging = false;

        function updateSlider(clientX) {
            const rect = sliderContainer.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;

            // Constrain between 0% and 100%
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            // Apply style updates
            afterImageWrap.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        }

        // Mouse events
        sliderHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch events for mobile responsiveness
        sliderHandle.addEventListener('touchstart', (e) => {
            isDragging = true;
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            if (e.touches.length > 0) {
                updateSlider(e.touches[0].clientX);
            }
        });

        // Click directly on container to jump to that slide position
        sliderContainer.addEventListener('click', (e) => {
            // Avoid triggering if clicking the handle button itself
            if (e.target.closest('#slider-handle-bar')) return;
            updateSlider(e.clientX);
        });
    }

    /* ==========================================================================
       INTERACTIVE PRICE CALCULATOR
       ========================================================================== */
    const calcServiceCards = document.querySelectorAll('.calc-service-card');
    const calcVolumeInput = document.getElementById('calc-volume');
    const volumeCurrentVal = document.getElementById('volume-current-val');
    const volumeLabelText = document.getElementById('volume-label-text');
    
    // Addons
    const checkElevator = document.getElementById('calc-elevator');
    const checkFloor = document.getElementById('calc-floor');
    const checkHeavy = document.getElementById('calc-heavy');
    const checkDistance = document.getElementById('calc-distance');
    
    // Result
    const calcPriceNum = document.getElementById('calc-price-num');

    let activeService = 'kurti';

    // Pricing rates table
    const serviceRates = {
        kurti: {
            base: 15,          // per m2 (BGN)
            minVal: 5,
            maxVal: 150,
            defVal: 20,
            unit: 'м²',
            label: '2. Обем на работа (Квадратни метри - м²):'
        },
        chisti: {
            base: 10,          // per m3 (BGN)
            minVal: 2,
            maxVal: 60,
            defVal: 8,
            unit: 'м³',
            label: '2. Количество боклуци (Кубични метри - м³):'
        },
        izvozva: {
            base: 70,          // per course/dumpster (BGN)
            minVal: 1,
            maxVal: 8,
            defVal: 1,
            unit: 'курс/а',
            label: '2. Брой курсове с камион (извозване):'
        },
        hamali: {
            base: 25,          // per hour per worker (BGN)
            minVal: 2,
            maxVal: 24,
            defVal: 3,
            unit: 'часа',
            label: '2. Времетраене на работата (в часове):'
        }
    };

    function calculatePrice() {
        const rateInfo = serviceRates[activeService];
        const quantity = parseFloat(calcVolumeInput.value);
        let baseCost = rateInfo.base * quantity;

        // Apply dynamic multipliers
        let multiplier = 1.0;

        if (checkElevator && checkElevator.checked) {
            multiplier -= 0.05; // 5% discount if elevator is available
        }
        if (checkFloor && checkFloor.checked) {
            multiplier += 0.20; // 20% surcharge for manual carrying up stairs
        }

        let finalPrice = baseCost * multiplier;

        // Apply flat addons
        if (checkHeavy && checkHeavy.checked) {
            finalPrice += 40;   // Heavy items fee in BGN (40 лв.)
        }
        if (checkDistance && checkDistance.checked) {
            finalPrice += 40;   // Surcharge outside city limits in BGN (40 лв.)
        }

        // Apply absolute minimum price thresholds in BGN
        const minimums = { kurti: 80, chisti: 60, izvozva: 70, hamali: 50 };
        if (finalPrice < minimums[activeService]) {
            finalPrice = minimums[activeService];
        }

        // Animate price change
        const roundedPrice = Math.round(finalPrice);
        animateNumber(calcPriceNum, roundedPrice);
    }

    function animateNumber(element, target) {
        if (!element) return;
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const duration = 250; // ms
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const value = Math.round(current + (target - current) * easeProgress);
            
            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    if (calcServiceCards.length > 0 && calcVolumeInput) {
        // Toggle service cards
        calcServiceCards.forEach(card => {
            card.addEventListener('click', () => {
                calcServiceCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                activeService = card.dataset.service;
                
                // Update range inputs depending on service variables
                const rate = serviceRates[activeService];
                calcVolumeInput.min = rate.minVal;
                calcVolumeInput.max = rate.maxVal;
                calcVolumeInput.value = rate.defVal;
                
                volumeLabelText.textContent = rate.label;
                volumeCurrentVal.textContent = `${rate.defVal} ${rate.unit}`;
                
                calculatePrice();
            });
        });

        // Volume range slider inputs
        calcVolumeInput.addEventListener('input', (e) => {
            const unit = serviceRates[activeService].unit;
            volumeCurrentVal.textContent = `${e.target.value} ${unit}`;
            calculatePrice();
        });

        // Attach event listeners to all extra checkboxes
        [checkElevator, checkFloor, checkHeavy, checkDistance].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', calculatePrice);
            }
        });

        // Initialize first calculation
        calculatePrice();
    }

    /* ==========================================================================
       ANIMATED STAT COUNTERS (INTERSECTION OBSERVER)
       ========================================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateStat(element, targetNum) {
        const duration = 2000; // 2 seconds animation
        const startTime = performance.now();
        const startNum = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(startNum + (targetNum - startNum) * easeProgress);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = targetNum;
            }
        }
        requestAnimationFrame(update);
    }

    if (statNumbers.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetEl = entry.target;
                    const targetNum = parseInt(targetEl.getAttribute('data-target'));
                    animateStat(targetEl, targetNum);
                    observer.unobserve(targetEl);
                }
            });
        }, observerOptions);

        statNumbers.forEach(num => counterObserver.observe(num));
    }

    /* ==========================================================================
       FAQ ACCORDION
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const faqItem = btn.parentElement;
            const answer = btn.nextElementSibling;
            const isOpen = faqItem.classList.contains('active');

            // Close all other open accordion panels
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            });

            // If it wasn't open, open it
            if (!isOpen) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* ==========================================================================
       FORM SUBMISSION SIMULATION
       ========================================================================== */
    const quickBookingForm = document.getElementById('quick-booking-form');
    const formSuccessMsg = document.getElementById('form-success');
    const formSubmitBtn = document.getElementById('form-submit-btn');

    if (quickBookingForm && formSuccessMsg && formSubmitBtn) {
        quickBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Visual loading state
            const originalBtnText = formSubmitBtn.textContent;
            formSubmitBtn.disabled = true;
            formSubmitBtn.textContent = 'Изпращане...';

            // Simulate server request delay
            setTimeout(() => {
                // Success actions
                formSuccessMsg.style.display = 'block';
                formSubmitBtn.textContent = 'Заявката е изпратена!';
                formSubmitBtn.style.backgroundColor = '#10b981';
                
                // Clear fields
                quickBookingForm.reset();

                // Re-enable form after some seconds
                setTimeout(() => {
                    formSuccessMsg.style.display = 'none';
                    formSubmitBtn.disabled = false;
                    formSubmitBtn.textContent = originalBtnText;
                    formSubmitBtn.style.backgroundColor = '';
                }, 4000);

            }, 1200);
        });
    }

    /* ==========================================================================
       SCROLL EFFECT FOR MAIN NAVBAR GLASSMORPHISM
       ========================================================================== */
    const header = document.querySelector('.main-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.padding = '10px 0';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 4px 20px -10px rgba(15, 23, 42, 0.15)';
            } else {
                header.style.padding = '16px 0';
                header.style.backgroundColor = 'var(--color-bg-glass)';
                header.style.boxShadow = '';
            }
        });
    }
});
