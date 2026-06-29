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

  // --- Video Gallery & Cinema Mode ---
  const VIDEOS_DATA = [
    {
      id: "sedd2J_a4Wg",
      title: "\"קלסטרופוביה במרחב פתוח\" - פרק 1: מבעד לצידו האחר של הראש",
      channel: "shaitt",
      channelName: "@shaitt1137",
      category: "flagship",
      badge: "סדרת הדגל ✦ פרק 1",
      desc: "סרט AI קולנועי באורך 15 דקות המבוסס על סיפור מקורי מתוך הספר \"קלסטרופוביה במרחב פתוח\". נוצר בעזרת Stable Diffusion וכלים מתקדמים.",
      glowColors: "rgba(124, 58, 237, 0.45), rgba(99, 102, 241, 0.35)",
      story: {
        about: "לפני כ-15 שנה, במהלך השירות הצבאי שלי, מצאתי את עצמי בבית החולים עובר ניתוח באוזן (עור התוף) תחת הרדמה מלאה. באותה תקופה טלפונים חכמים לא היו נפוצים, ולכן השתמשתי במחברת ועט שליוו אותי תמיד כדי לכתוב סיפורים קצרים. לפני הניתוח כתבתי חצי מהסיפור, ואחרי הניתוח ובמהלך ההתאוששות שלי בבית החולים, המשכתי לפתח אותו. הסיפור הפך לחלק מהספר שלי \"קלסטרופוביה במרחב פתוח\".",
        extra: "לאחר כ-15 שנה ו-4 חודשים של עבודה אינטנסיבית על הסרט, לצד התפתחות הבינה המלאכותית, הצלחתי להפוך את הסיפור הקצר לסרט קולנועי מלא של כ-15 דקות! כל התוכן והתסריט נכתבו על ידי, ללא שימוש בבינה מלאכותית לכתיבה.",
        techImages: "Stable Diffusion (A1111) עם מודל lunarityxlturbo (הנבחר בשל מהירותו ואיכותו הגבוהה לסרטים ארוכים)",
        techMotion: "Luma AI, Runway Gen-2 וכלים מתקדמים נוספים",
        techOther: "עריכה תלת-מימדית וטכנולוגיית מציאות מדומה (VR) ליצירת עומק ופרספקטיבה"
      }
    },
    {
      id: "y83526-song",
      title: "כתבתי לך שיר - יצירת מוזיקה ואנימציה ב-AI",
      channel: "shaitt",
      channelName: "@shaitt1137",
      category: "shaitt",
      badge: "מוזיקה מקורית ✦ AI",
      desc: "קליפ ושיר מקוריים שנוצרו בעזרת בינה מלאכותית. הלחן, ההפקה המוזיקלית, האנימציה ועריכת הקליפ הופקו כולם בכלי AI מתקדמים.",
      glowColors: "rgba(236, 72, 153, 0.45), rgba(124, 58, 237, 0.35)",
      story: {
        about: "שילוב ייחודי של יצירת מוזיקה (Suno/Udio) עם אנימציית וידאו שנוצרה ב-Stable Diffusion. הפרויקט מדגים כיצד בינה מלאכותית מאפשרת ליוצר בודד להפיק קליפ מוזיקלי שלם ברמה מקצועית מאפס.",
        extra: "כל התפקידים - מהכותב, המלחין, המעבד ועד לאנימטור והעורך - נעשו על ידי שימוש מושכל בפרומפטים ובכלים ג'נרטיביים מתקדמים.",
        techImages: "Stable Diffusion, Midjourney v6",
        techMotion: "Suno AI (למוזיקה), Runway Gen-2 (לוידאו)",
        techOther: "Adobe Premiere Pro לעריכה סופית ותיקוני צבע"
      }
    },
    {
      id: "y83526-bts",
      title: "תהליך היצירה של סרטי AI: מאחורי הקלעים",
      channel: "shaitt",
      channelName: "@shaitt1137",
      category: "shaitt",
      badge: "מאחורי הקלעים ✦ מדריך",
      desc: "סקירה מקיפה של תהליך העבודה (Workflow) של סרט ה-AI שלי. איך משלבים מודלים של תמונה ותנועה כדי ליצור עקביות בין סצנות.",
      glowColors: "rgba(16, 185, 129, 0.45), rgba(99, 102, 241, 0.35)",
      story: {
        about: "סרטון הסבר המפרט את הבעיות המרכזיות בעבודה על סרטים ארוכים ב-AI, כמו שמירה על עקביות של דמויות (Character Consistency) ורקעים בין שוטים שונים.",
        extra: "מתאים במיוחד למי שרוצה להבין את הצד הטכני והמעשי של הפקת סרטים ואיך הכלים השונים מתחברים לפייפליין עבודה אחד.",
        techImages: "Stable Diffusion WebUI (Automatic1111) עם בקרות ControlNet",
        techMotion: "AnimateDiff, Luma Dream Machine",
        techOther: "טכניקות Inpainting ו-Outpainting מתקדמות לשמירה על עקביות"
      }
    },
    {
      id: "y83526-vlog",
      title: "ולוג יוצרים: איך בניתי את ערוץ היוטיוב השני שלי ב-88 ימים",
      channel: "the88creator",
      channelName: "@the88creator",
      category: "the88creator",
      badge: "ולוג יוצרים ✦ ערוץ 2",
      desc: "סרטון הפתיחה של ערוץ @the88creator. האסטרטגיה מאחורי בניית קהילה, תדירות העלאת סרטונים ואתגר ה-88 סרטונים ב-2025.",
      glowColors: "rgba(245, 158, 11, 0.45), rgba(239, 68, 68, 0.35)",
      story: {
        about: "כיצד ליצור תוכן עקבי ואיכותי ביוטיוב בלי להישחק. בסרטון זה אני משתף את המטרות של ערוץ the88creator ואת הכלים שעוזרים לי לנהל שני ערוצים במקביל.",
        extra: "טיפים מעשיים ליוצרי תוכן מתחילים שרוצים לפרוץ ביוטיוב, להתגבר על מחסומי כתיבה ולערוך סרטונים במהירות.",
        techImages: "מצלמות mirrorless וציוד סאונד מקצועי",
        techMotion: "CapCut Pro לעריכה מהירה וממוקדת",
        techOther: "כלי AI לאופטימיזציה של כותרות, תיאורים ותמונות ממוזערות (Thumbnails)"
      }
    },
    {
      id: "y83526-logo",
      title: "איך להשתמש ב-Stable Diffusion ליצירת לוגו תלת-מימד",
      channel: "the88creator",
      channelName: "@the88creator",
      category: "the88creator",
      badge: "מדריך ✦ Stable Diffusion",
      desc: "מדריך מעשי צעד-אחר-צעד ליצירת לוגו תלת-מימד מבריק (כמו לוגו היוצר הקיים בעמוד הנחיתה) בעזרת בינה מלאכותית.",
      glowColors: "rgba(6, 182, 212, 0.45), rgba(99, 102, 241, 0.35)",
      story: {
        about: "במדריך זה נלמד איך לקחת סקיצה דו-מימדית פשוטה ולהפוך אותה לטקסטורה ומודל תלת-מימדי עשיר עם החזר אור באמצעות כללי פרומפטים מורכבים ב-SD.",
        extra: "נציג שימוש בטכנולוגיות ControlNet Depth ו-Normal Maps ליצירת עומק וגימור זכוכית או מתכת מבריקה.",
        techImages: "Stable Diffusion WebUI, ControlNet, Model-Viewer Integration",
        techMotion: "Blender לעיבוד ה-GLB הסופי",
        techOther: "CSS/JS להטמעת המודל בצורה רספונסיבית באתר האינטרנט"
      }
    }
  ];

  const mainVideoPlayer = document.getElementById('main-video-player');
  const ambientGlow = document.getElementById('ambient-glow');
  const cinemaTitle = document.getElementById('cinema-title');
  const videoBadge = document.getElementById('video-badge');
  const videoChannelTag = document.getElementById('video-channel-tag');
  
  // Tab elements
  const storyTabButtons = document.querySelectorAll('.story-tab-btn');
  const storyTabContents = document.querySelectorAll('.story-tab-content');
  
  // Story details elements
  const videoStoryAbout = document.getElementById('video-story-about');
  const videoStoryExtra = document.getElementById('video-story-extra');
  const videoTechImages = document.getElementById('video-tech-images');
  const videoTechMotion = document.getElementById('video-tech-motion');
  const videoTechOther = document.getElementById('video-tech-other');
  
  // Filters and Grid
  const filterButtons = document.querySelectorAll('.filter-btn');
  const videosGrid = document.getElementById('videos-grid');
  
  // Cinema Mode
  const btnCinemaMode = document.getElementById('btn-cinema-mode');

  // --- 1. Story Tab Switching ---
  storyTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      storyTabButtons.forEach(b => b.classList.remove('active'));
      storyTabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabName}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // --- 2. Load Video to Spotlight ---
  const loadVideo = (video) => {
    if (!mainVideoPlayer) return;
    
    // Set iframe source (with enablejsapi=1 for controller control)
    let embedUrl = `https://www.youtube.com/embed/${video.id}?enablejsapi=1&rel=0`;
    // If it's a mock id (starts with y83526), use the flagship video for preview
    if (video.id.startsWith('y83526')) {
      embedUrl = `https://www.youtube.com/embed/sedd2J_a4Wg?enablejsapi=1&rel=0`;
    }
    mainVideoPlayer.src = embedUrl;
    
    // Update basic meta
    if (cinemaTitle) cinemaTitle.textContent = video.title;
    if (videoBadge) videoBadge.textContent = video.badge;
    
    // Update Channel Tag
    if (videoChannelTag) {
      videoChannelTag.textContent = video.channelName;
      videoChannelTag.className = `video-channel-tag tag-${video.channel}`;
    }
    
    // Update Tab Content
    if (videoStoryAbout) videoStoryAbout.textContent = video.story.about;
    if (videoStoryExtra) videoStoryExtra.textContent = video.story.extra;
    if (videoTechImages) videoTechImages.textContent = video.story.techImages;
    if (videoTechMotion) videoTechMotion.textContent = video.story.techMotion;
    if (videoTechOther) videoTechOther.textContent = video.story.techOther;
    
    // Update Ambient Glow Colors
    if (ambientGlow && video.glowColors) {
      ambientGlow.style.background = `radial-gradient(circle, ${video.glowColors}, transparent 70%)`;
    }
  };

  // --- 3. Render Video Gallery Grid ---
  const renderGrid = (filter = 'all') => {
    if (!videosGrid) return;
    
    videosGrid.innerHTML = '';
    
    // Filter videos
    const filteredVideos = VIDEOS_DATA.filter(video => {
      if (filter === 'all') return true;
      if (filter === 'flagship') return video.category === 'flagship';
      if (filter === 'shaitt') return video.channel === 'shaitt';
      if (filter === 'the88creator') return video.channel === 'the88creator';
      return true;
    });
    
    // Render cards
    filteredVideos.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card reveal visible';
      
      // Pull MQ YouTube thumbnails
      let thumbUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
      if (video.id.startsWith('y83526')) {
        thumbUrl = `https://img.youtube.com/vi/sedd2J_a4Wg/mqdefault.jpg`;
      }
      
      card.innerHTML = `
        <div class="video-thumbnail-wrapper">
          <img src="${thumbUrl}" alt="${video.title}" loading="lazy" />
          <div class="video-play-overlay">
            <div class="video-play-button-icon">▶</div>
          </div>
          <span class="video-card-badge">${video.badge.split(' ✦ ')[0]}</span>
        </div>
        <div class="video-card-content">
          <div class="video-card-channel tag-${video.channel}">${video.channelName}</div>
          <h4 class="video-card-title">${video.title}</h4>
          <p class="video-card-desc">${video.desc}</p>
        </div>
      `;
      
      // Click event to load video
      card.addEventListener('click', () => {
        loadVideo(video);
        
        // Scroll to cinema spotlight smoothly
        const spotlightElement = document.getElementById('cinema-spotlight');
        if (spotlightElement) {
          spotlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      videosGrid.appendChild(card);
    });
  };

  // --- 4. Filtering Logic ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      renderGrid(filter);
    });
  });

  // --- 5. Cinema Mode Implementation ---
  if (btnCinemaMode) {
    btnCinemaMode.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('cinema-darkened');
      btnCinemaMode.classList.toggle('active');
      
      if (document.body.classList.contains('cinema-darkened')) {
        btnCinemaMode.innerHTML = '<span class="icon">✨</span> צא ממצב קולנוע';
      } else {
        btnCinemaMode.innerHTML = '<span class="icon">🎬</span> מצב קולנוע';
      }
    });

    // Close cinema mode when clicking anywhere outside player
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('cinema-darkened')) {
        const spotlight = document.getElementById('cinema-spotlight');
        if (spotlight && !spotlight.contains(e.target)) {
          document.body.classList.remove('cinema-darkened');
          btnCinemaMode.classList.remove('active');
          btnCinemaMode.innerHTML = '<span class="icon">🎬</span> מצב קולנוע';
        }
      }
    });

    // Close cinema mode with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('cinema-darkened')) {
        document.body.classList.remove('cinema-darkened');
        btnCinemaMode.classList.remove('active');
        btnCinemaMode.innerHTML = '<span class="icon">🎬</span> מצב קולנוע';
      }
    });
  }

  // --- 6. Initial Render ---
  renderGrid();
  if (ambientGlow) {
    ambientGlow.style.background = 'radial-gradient(circle, rgba(124, 58, 237, 0.45), rgba(99, 102, 241, 0.35) 40%, transparent 70%)';
  }

});

