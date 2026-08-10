/* =========================================================
   FORGE ATHLETIC CLUB -- script.js
   All interactivity for the site lives here. The file is
   organized into clearly labeled feature blocks. Every block
   wires up one job: find the relevant HTML elements (by id
   or class), then attach the behavior described in style.css
   (e.g. toggling the classes .scrolled, .visible, .open, etc.)
========================================================= */

/* Run everything only after the full HTML document has loaded,
   so we never try to grab an element that doesn't exist yet. */
document.addEventListener("DOMContentLoaded", function () {

  /* =======================================================
     1. RESPONSIVE MOBILE NAVIGATION MENU
     Toggles the off-canvas nav panel (see .nav-links.nav-open
     in style.css) when the hamburger button is clicked, and
     closes it again when a link inside is clicked.
  ======================================================= */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  function toggleMobileMenu() {
    const isOpen = navLinks.classList.toggle("nav-open");
    hamburgerBtn.classList.toggle("open");
    // aria-expanded tells screen readers whether the menu is open
    hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  hamburgerBtn.addEventListener("click", toggleMobileMenu);

  // Close the mobile menu automatically once a link is tapped,
  // so the user isn't left staring at the menu after navigating.
  const allNavLinkElements = navLinks.querySelectorAll("a");
  allNavLinkElements.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navLinks.classList.contains("nav-open")) {
        toggleMobileMenu();
      }
    });
  });


  /* =======================================================
     2. STICKY NAVIGATION ON SCROLL
     Adds a ".scrolled" class to the header once the page has
     scrolled past a small threshold, giving the nav a solid
     background instead of a transparent one (see CSS).
  ======================================================= */
  const siteHeader = document.getElementById("siteHeader");
  const SCROLL_THRESHOLD = 40; // pixels scrolled before the header "locks in"

  function handleHeaderScrollState() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleHeaderScrollState);
  handleHeaderScrollState(); // run once on load in case the page is refreshed mid-scroll


  /* =======================================================
     3. SMOOTH SCROLLING FOR ANCHOR LINKS
     Intercepts clicks on any link that points to an in-page
     "#section" anchor and scrolls to it smoothly, accounting
     for the sticky header's height so section titles aren't
     hidden underneath it.
  ======================================================= */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const targetId = anchor.getAttribute("href");
      // Ignore bare "#" links (like icon placeholders in the footer)
      if (targetId.length <= 1) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      event.preventDefault();
      const headerHeight = siteHeader.offsetHeight;
      const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });


  /* =======================================================
     4. ACTIVE NAVIGATION LINK HIGHLIGHTING
     Watches which section is currently in view using
     IntersectionObserver and highlights the matching nav
     link (adds .active-link, see CSS underline effect).
  ======================================================= */
  const observedSections = document.querySelectorAll("main section[id]");
  const desktopNavLinks = document.querySelectorAll(".nav-links .nav-link");

  const navHighlightObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");

          desktopNavLinks.forEach(function (link) {
            const linkTargetsThisSection = link.getAttribute("href") === "#" + sectionId;
            link.classList.toggle("active-link", linkTargetsThisSection);
          });
        }
      });
    },
    {
      // A section counts as "current" once it crosses the vertical
      // middle-ish band of the viewport, which feels natural while scrolling.
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    }
  );

  observedSections.forEach(function (section) {
    navHighlightObserver.observe(section);
  });


  /* =======================================================
     5. FADE-IN ANIMATIONS ON SCROLL
     Every element with the ".fade-in" class starts invisible
     (see CSS). Once it scrolls into view, we add ".visible"
     which triggers the CSS opacity/transform transition.
  ======================================================= */
  const fadeElements = document.querySelectorAll(".fade-in");

  const fadeInObserver = new IntersectionObserver(
    function (entries, observerInstance) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Stop watching once it's shown -- no need to re-animate on re-scroll
          observerInstance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  fadeElements.forEach(function (element) {
    fadeInObserver.observe(element);
  });


  /* =======================================================
     6. HERO STAT COUNT-UP ANIMATION
     Animates the hero's numeric stats from 0 up to their
     target value once the hero scrolls into view, giving the
     page an energetic opening moment.
  ======================================================= */
  const statNumbers = document.querySelectorAll(".hero-stat-number");

  function animateCountUp(element) {
    const targetValue = parseInt(element.getAttribute("data-count"), 10);
    const durationMs = 1400;
    const startTime = performance.now();

    function updateFrame(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentValue = Math.floor(progress * targetValue);
      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        element.textContent = targetValue; // avoid rounding short-falls
      }
    }

    requestAnimationFrame(updateFrame);
  }

  const statObserver = new IntersectionObserver(
    function (entries, observerInstance) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCountUp(entry.target);
          observerInstance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (statElement) {
    statObserver.observe(statElement);
  });


  /* =======================================================
     7. FAQ ACCORDION
     Clicking a question toggles its answer open/closed. We
     use the answer's real scrollHeight to animate max-height
     smoothly, and close any other open item so only one FAQ
     answer is visible at a time.
  ======================================================= */
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach(function (questionButton) {
    questionButton.addEventListener("click", function () {
      const answerPanel = questionButton.nextElementSibling;
      const isCurrentlyOpen = questionButton.classList.contains("open");

      // Close every other FAQ item first (accordion behavior)
      faqQuestions.forEach(function (otherButton) {
        otherButton.classList.remove("open");
        otherButton.setAttribute("aria-expanded", "false");
        otherButton.nextElementSibling.style.maxHeight = null;
        otherButton.nextElementSibling.classList.remove("open");
      });

      // Then re-open this one, unless it was the one already open
      // (clicking an open question should close it, not re-open it)
      if (!isCurrentlyOpen) {
        questionButton.classList.add("open");
        questionButton.setAttribute("aria-expanded", "true");
        answerPanel.classList.add("open");
        answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
      }
    });
  });


  /* =======================================================
     8. TESTIMONIAL SLIDER
     Shows one testimonial slide at a time by translating the
     flex track horizontally. Prev/next buttons and clickable
     dot indicators all move to a given slide index.
  ======================================================= */
  const testimonialTrack = document.getElementById("testimonialTrack");
  const testimonialSlides = testimonialTrack.querySelectorAll(".testimonial-slide");
  const prevTestimonialBtn = document.getElementById("prevTestimonial");
  const nextTestimonialBtn = document.getElementById("nextTestimonial");
  const sliderDotsContainer = document.getElementById("sliderDots");

  let currentSlideIndex = 0;

  // Build one dot button per slide, so the dot count always matches content
  testimonialSlides.forEach(function (_, index) {
    const dot = document.createElement("button");
    dot.classList.add("slider-dot");
    dot.setAttribute("aria-label", "Go to testimonial " + (index + 1));
    if (index === 0) dot.classList.add("active-dot");

    dot.addEventListener("click", function () {
      goToSlide(index);
    });

    sliderDotsContainer.appendChild(dot);
  });

  const allDots = sliderDotsContainer.querySelectorAll(".slider-dot");

  function goToSlide(index) {
    const totalSlides = testimonialSlides.length;
    // Wrap around so "next" from the last slide returns to the first
    currentSlideIndex = (index + totalSlides) % totalSlides;

    const offsetPercentage = currentSlideIndex * -100;
    testimonialTrack.style.transform = "translateX(" + offsetPercentage + "%)";

    allDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active-dot", dotIndex === currentSlideIndex);
    });
  }

  prevTestimonialBtn.addEventListener("click", function () {
    goToSlide(currentSlideIndex - 1);
  });

  nextTestimonialBtn.addEventListener("click", function () {
    goToSlide(currentSlideIndex + 1);
  });

  // Auto-advance the slider every 6 seconds for a "living" feel
  setInterval(function () {
    goToSlide(currentSlideIndex + 1);
  }, 6000);


  /* =======================================================
     9. BMI CALCULATOR
     Reads height (cm) and weight (kg) from the form, computes
     BMI = weight(kg) / (height(m))^2, and shows both the
     number and its health category.
  ======================================================= */
  const bmiForm = document.getElementById("bmiForm");
  const bmiHeightInput = document.getElementById("bmiHeight");
  const bmiWeightInput = document.getElementById("bmiWeight");
  const bmiResultBox = document.getElementById("bmiResult");

  function getBmiCategory(bmiValue) {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Healthy Range";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  }

  bmiForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading on submit

    const heightCm = parseFloat(bmiHeightInput.value);
    const weightKg = parseFloat(bmiWeightInput.value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      bmiResultBox.textContent = "Please enter a valid height and weight.";
      bmiResultBox.classList.remove("has-result");
      return;
    }

    const heightMeters = heightCm / 100;
    const bmiValue = weightKg / (heightMeters * heightMeters);
    const roundedBmi = bmiValue.toFixed(1);
    const category = getBmiCategory(bmiValue);

    bmiResultBox.textContent = "Your BMI is " + roundedBmi + " (" + category + ")";
    bmiResultBox.classList.add("has-result");
  });


  /* =======================================================
     10. CONTACT FORM VALIDATION
     Validates name, email, phone, and message on submit.
     Shows an inline error message under any invalid field
     and only shows the success message once everything
     passes.
  ======================================================= */
  const contactForm = document.getElementById("contactForm");
  const contactName = document.getElementById("contactName");
  const contactEmail = document.getElementById("contactEmail");
  const contactPhone = document.getElementById("contactPhone");
  const contactMessage = document.getElementById("contactMessage");
  const formSuccessMessage = document.getElementById("formSuccess");

  // Simple, readable helper: shows/clears one field's error message and styling
  function setFieldError(inputElement, errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    errorElement.textContent = message;
    inputElement.classList.toggle("input-error", Boolean(message));
  }

  function isValidEmail(emailValue) {
    // A practical (not exhaustive) email pattern: text@text.text
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(emailValue);
  }

  function isValidPhone(phoneValue) {
    // Accepts digits, spaces, dashes, parentheses, and an optional leading +
    const phonePattern = /^[0-9+()\-\s]{7,20}$/;
    return phonePattern.test(phoneValue);
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault(); // handle everything ourselves instead of a real network submit
    formSuccessMessage.textContent = "";

    let formIsValid = true;

    if (contactName.value.trim().length < 2) {
      setFieldError(contactName, "nameError", "Please enter your full name.");
      formIsValid = false;
    } else {
      setFieldError(contactName, "nameError", "");
    }

    if (!isValidEmail(contactEmail.value.trim())) {
      setFieldError(contactEmail, "emailError", "Please enter a valid email address.");
      formIsValid = false;
    } else {
      setFieldError(contactEmail, "emailError", "");
    }

    if (!isValidPhone(contactPhone.value.trim())) {
      setFieldError(contactPhone, "phoneError", "Please enter a valid phone number.");
      formIsValid = false;
    } else {
      setFieldError(contactPhone, "phoneError", "");
    }

    if (contactMessage.value.trim().length < 10) {
      setFieldError(contactMessage, "messageError", "Message should be at least 10 characters.");
      formIsValid = false;
    } else {
      setFieldError(contactMessage, "messageError", "");
    }

    if (formIsValid) {
      formSuccessMessage.textContent = "Thanks! Your message has been sent -- we'll be in touch shortly.";
      contactForm.reset();
    }
  });


  /* =======================================================
     11. SCROLL-TO-TOP BUTTON
     Shows a floating button once the user scrolls down the
     page, and smoothly scrolls back to the top when clicked.
  ======================================================= */
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const SCROLL_TOP_SHOW_AT = 500; // pixels scrolled before the button appears

  function handleScrollToTopVisibility() {
    scrollToTopBtn.classList.toggle("show-btn", window.scrollY > SCROLL_TOP_SHOW_AT);
  }

  window.addEventListener("scroll", handleScrollToTopVisibility);
  handleScrollToTopVisibility();

  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  /* =======================================================
     12. FOOTER YEAR
     Small touch: keeps the copyright year in the footer
     accurate automatically, without needing manual edits.
  ======================================================= */
  document.getElementById("currentYear").textContent = new Date().getFullYear();

});
