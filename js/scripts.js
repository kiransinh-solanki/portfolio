// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// DOM Elements
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.querySelector('i').classList.toggle('fa-bars');
    menuToggle.querySelector('i').classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');
    }
});

// Smooth scroll for navigation links
navLinksItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Close mobile menu
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');

        // Smooth scroll to target
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Header scroll behavior
let lastScroll = 0;
const scrollThreshold = 100; // Minimum scroll before header state changes

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class based on scroll position
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Handle header show/hide based on scroll direction
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
        // Scrolling down & past threshold
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll) {
        // Scrolling up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Active section highlighting
function highlightActiveSection() {
    const scrollPosition = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinksItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// Contact Form Implementation
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Initialize EmailJS with public key
    emailjs.init("VRFxXcZfean_EbMWQ");

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get submit button and store original text
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText ? btnText.textContent : submitBtn.textContent;

        try {
            // Show loading state
            if (btnText) {
                btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }
            submitBtn.disabled = true;

            // Get form data
            const formData = {
                from_name: contactForm.querySelector('#name').value.trim(),
                from_email: contactForm.querySelector('#email').value.trim(),
                phone: contactForm.querySelector('#phone').value.trim(),
                subject: contactForm.querySelector('#subject').value.trim(),
                message: contactForm.querySelector('#message').value.trim(),
                services: Array.from(contactForm.querySelectorAll('input[name="services[]"]:checked'))
                    .map(cb => cb.value)
                    .join(', ')
            };

            // Validate form data
            const validationError = validateFormData(formData);
            if (validationError) {
                throw new Error(validationError);
            }

            // Send email using EmailJS
            const response = await emailjs.send(
                'service_97nge0j', // Your EmailJS service ID
                'template_u7p4emk', // Your EmailJS template ID
                formData
            );

            if (response.status === 200) {
                showMessage('success', 'Message Sent!', 'Thank you for reaching out. I will get back to you soon.');
                contactForm.reset();
            } else {
                throw new Error('Failed to send message. Please try again.');
            }

        } catch (error) {
            console.error('Form Error:', error);
            
            let errorMessage = error.message;
            if (error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please try again.';
            } else if (!error.message.includes('Please')) {
                errorMessage = 'Failed to send message. Please try again.';
            }
            
            showMessage('error', 'Error', errorMessage);
        } finally {
            // Reset button state
            if (btnText) {
                btnText.textContent = originalText;
            } else {
                submitBtn.textContent = originalText;
            }
            submitBtn.disabled = false;
        }
    });
});

// Validate form data
function validateFormData(data) {
    if (!data.from_name) {
        return 'Please enter your name.';
    }
    
    if (!data.from_email) {
        return 'Please enter your email address.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.from_email)) {
        return 'Please enter a valid email address.';
    }
    
    if (!data.phone) {
        return 'Please enter your phone number.';
    }
    
    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
    if (!phoneRegex.test(data.phone)) {
        return 'Please enter a valid phone number.';
    }
    
    if (!data.subject) {
        return 'Please enter a subject.';
    }
    
    if (!data.message) {
        return 'Please enter your message.';
    }
    
    if (!data.services) {
        return 'Please select at least one service.';
    }
    
    return null;
}

// Show message function
function showMessage(type, title, text) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-popup ${type}`;
    
    messageEl.innerHTML = `
        <div class="message-content">
            <div class="message-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="message-text">
                <h3>${title}</h3>
                <p>${text}</p>
            </div>
            <button class="message-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to document
    document.body.appendChild(messageEl);

    // Show with animation
    requestAnimationFrame(() => {
        messageEl.classList.add('show');
    });

    // Setup close button
    const closeBtn = messageEl.querySelector('.message-close');
    closeBtn.addEventListener('click', () => {
        messageEl.classList.remove('show');
        setTimeout(() => messageEl.remove(), 300);
    });

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 5000);

    // Clear timeout if message is manually closed
    messageEl.addEventListener('click', () => clearTimeout(timeout));
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('h3');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
            faqItem.querySelector('.faq-answer').style.maxHeight = null;
        });
        
        // Open clicked item if it wasn't open
        if (!isOpen) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// Project image gallery
const projectCards = document.querySelectorAll('.project-card');
    
projectCards.forEach(card => {
    const mainImage = card.querySelector('.project-image > img');
    const thumbnails = card.querySelectorAll('.project-thumbnails img');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const tempSrc = mainImage.src;
            mainImage.src = thumb.src;
            thumb.src = tempSrc;
        });
    });
});

// Scroll to Top Button
const scrollButton = document.createElement('button');
scrollButton.innerHTML = '↑';
scrollButton.className = 'scroll-top';
document.body.appendChild(scrollButton);

scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
});


