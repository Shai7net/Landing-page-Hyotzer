/**
 * AI Workshop Landing Page — script.js
 * Hebrew validation, mobile menu, scroll effects and Formspree submission
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 3D Logo Model Configuration & Click Redirection ---
  const modelViewer = document.getElementById('logo-3d-model');
  if (modelViewer) {
    // 1. Configure reflective, shiny glass-like material properties on load
    modelViewer.addEventListener('load', () => {
      try {
        const materials = modelViewer.model.materials;
        for (const material of materials) {
          // Adjust standard PBR metallic-roughness settings
          try {
            if (material.pbrMetallicRoughness) {
              material.pbrMetallicRoughness.setRoughnessFactor(0.05);
              material.pbrMetallicRoughness.setMetallicFactor(0.9);
            }
          } catch (e) { /* PBR not supported on this material */ }

          // KHR_materials_transmission (glass effect)
          try {
            if (material.transmission) {
              material.transmission.setTransmissionFactor(0.85);
            }
          } catch (e) { /* Transmission extension not available */ }

          // KHR_materials_volume (thickness for refraction)
          try {
            if (material.volume) {
              material.volume.setThicknessFactor(0.5);
            }
          } catch (e) { /* Volume extension not available */ }

          // Clearcoat properties for secondary outer shine layer
          try {
            if (material.clearcoat) {
              material.clearcoat.setClearcoatFactor(1.0);
              material.clearcoat.setClearcoatRoughnessFactor(0.05);
            }
          } catch (e) { /* Clearcoat extension not available */ }
        }
      } catch (error) {
        console.warn('Could not apply shiny glass-like PBR materials:', error);
      }
    });

    // 2. Distinguish click vs drag for redirection to the works website
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    modelViewer.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    });

    modelViewer.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const elapsedTime = Date.now() - startTime;

      // If the cursor barely moved and was released quickly, count as a click
      if (distance < 8 && elapsedTime < 250) {
        window.open('https://hayotzer-project-resume.pages.dev', '_blank');
      }
    });
  }

  // --- Navigation & Scroll Effects ---
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navbarLinks = document.getElementById('navbar-links');
  const links = navbarLinks.querySelectorAll('a');

  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navbarLinks.classList.toggle('active');
  });

  // Close Mobile Menu on Link Click
  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navbarLinks.classList.remove('active');
    });
  });

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.classList.add('visible');
      }
    });
  };

  // Run on load and scroll
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger initial check
  // --- Form Validation & Submission for Web3Forms ---
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('btn-submit');
  const formMessage = document.getElementById('form-message');

  // Input Fields
  const nameInput = document.getElementById('full_name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');

  // Error Message Elements
  const errorName = document.getElementById('error-name');
  const errorPhone = document.getElementById('error-phone');
  const errorEmail = document.getElementById('error-email');

  // Helper to validate Email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper to validate Phone format (simple Hebrew/international phone check: min 9 digits)
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9\-+\s]{9,15}$/;
    return phoneRegex.test(phone.trim());
  };

  // Real-time validation clearing
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim() !== '') {
      nameInput.classList.remove('invalid');
      errorName.classList.remove('visible');
    }
  });

  phoneInput.addEventListener('input', () => {
    if (validatePhone(phoneInput.value)) {
      phoneInput.classList.remove('invalid');
      errorPhone.classList.remove('visible');
    }
  });

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) {
      emailInput.classList.remove('invalid');
      errorEmail.classList.remove('visible');
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status
    let isValid = true;
    formMessage.className = 'form-message';
    formMessage.textContent = '';

    // 1. Honeypot check (Web3Forms uses checkbox "botcheck")
    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      // Quietly ignore spam bot submission
      formMessage.textContent = 'הפרטים נשלחו בהצלחה, אחזור אליך בהקדם.';
      formMessage.classList.add('success');
      form.reset();
      return;
    }

    // 2. Validate Name
    if (nameInput.value.trim() === '') {
      nameInput.classList.add('invalid');
      errorName.classList.add('visible');
      isValid = false;
    } else {
      nameInput.classList.remove('invalid');
      errorName.classList.remove('visible');
    }

    // 3. Validate Phone
    if (!validatePhone(phoneInput.value)) {
      phoneInput.classList.add('invalid');
      errorPhone.classList.add('visible');
      isValid = false;
    } else {
      phoneInput.classList.remove('invalid');
      errorPhone.classList.remove('visible');
    }

    // 4. Validate Email
    if (!validateEmail(emailInput.value.trim())) {
      emailInput.classList.add('invalid');
      errorEmail.classList.add('visible');
      isValid = false;
    } else {
      emailInput.classList.remove('invalid');
      errorEmail.classList.remove('visible');
    }

    // Stop if invalid
    if (!isValid) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // 5. Submit Form data to Web3Forms via AJAX (with failover redundancy)
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    
    // List of keys to try sequentially (providing up to 500 free monthly submissions)
    const accessKeys = [
      "935723f9-3755-47a8-9f14-373647c06611",
      "2f68674a-afae-4e96-8d60-778b5f94c3c5"
    ];

    let submissionSuccess = false;
    let errorMessage = '';

    for (let i = 0; i < accessKeys.length; i++) {
      object.access_key = accessKeys[i];
      const json = JSON.stringify(object);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: json
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          submissionSuccess = true;
          break; // Stop trying if this key succeeded
        } else {
          console.warn(`Web3Forms key ${i + 1} failed:`, result.message);
          errorMessage = result.message || 'שגיאה בשליחת הטופס.';
        }
      } catch (error) {
        console.error(`Network error with key ${i + 1}:`, error);
        errorMessage = 'חיבור הרשת נכשל. נא לוודא חיבור לאינטרנט ולנסות שנית.';
      }
    }

    if (submissionSuccess) {
      // Success
      formMessage.textContent = 'הפרטים נשלחו בהצלחה, אחזור אליך בהקדם.';
      formMessage.className = 'form-message success';
      formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
    } else {
      // Error response if all keys failed
      formMessage.textContent = errorMessage || 'אירעה שגיאה בשליחת הטופס. נא לנסות שנית.';
      formMessage.className = 'form-message error';
      formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  });

});

