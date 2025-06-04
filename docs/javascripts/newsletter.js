/**
 * Newsletter Subscription Form Handler with Lazy-Loaded Turnstile
 * Only loads Turnstile when user interacts with the form
 */

class NewsletterForm {
  constructor(formId, config = {}) {
    this.form = document.getElementById(formId);
    this.config = {
      apiUrl: config.apiUrl || 'https://api.rnwolf.net/v1/newsletter/subscribe',
      siteKey: config.siteKey || '0x4AAAAAABf2ybtKSU3JJ7bC', // Replace with your actual site key
      theme: config.theme || 'auto',
      ...config
    };

    this.turnstileWidgetId = null;
    this.isSubmitting = false;
    this.turnstileLoaded = false;
    this.turnstileScriptLoaded = false;

    if (this.form) {
      this.init();
    }
  }

  init() {
    this.setupFormHandler();
    this.setupLazyTurnstile();
  }

  setupLazyTurnstile() {
    const emailInput = this.form.querySelector('input[name="email"]');
    const turnstileContainer = this.form.querySelector('.turnstile-container');

    if (!emailInput || !turnstileContainer) return;

    // Show a loading message in the Turnstile container
    turnstileContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.9em;">Security verification will load when you start typing...</p>';

    // Load Turnstile when user interacts with the form
    const loadTurnstile = () => {
      if (!this.turnstileScriptLoaded) {
        turnstileContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.9em;">Loading security verification...</p>';
        this.loadTurnstileScript();
        emailInput.removeEventListener('focus', loadTurnstile);
        emailInput.removeEventListener('input', loadTurnstile);
      }
    };

    // Load on first interaction
    emailInput.addEventListener('focus', loadTurnstile, { once: true });
    emailInput.addEventListener('input', loadTurnstile, { once: true });
  }

  loadTurnstileScript() {
    if (this.turnstileScriptLoaded) return;

    this.turnstileScriptLoaded = true;
    console.log('Loading Turnstile script...');

    // Only load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = () => {
        console.log('Turnstile script loaded successfully');
        this.setupTurnstile();
      };
      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        this.showTurnstileError();
      };
      document.head.appendChild(script);
    } else {
      console.log('Turnstile already available');
      this.setupTurnstile();
    }
  }

  setupTurnstile() {
    const turnstileContainer = this.form.querySelector('.turnstile-container');
    if (!turnstileContainer || this.turnstileLoaded) return;

    this.turnstileLoaded = true;
    console.log('Setting up Turnstile widget...');

    // Clear loading message
    turnstileContainer.innerHTML = '';

    try {
      this.turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: this.config.siteKey,
        theme: this.config.theme,
        callback: (token) => {
          console.log('Turnstile verification successful');
          this.enableSubmitButton();
        },
        'error-callback': () => {
          console.error('Turnstile verification failed');
          this.showMessage('Security verification failed. Please try again.', 'error');
        },
        'expired-callback': () => {
          console.log('Turnstile token expired');
          this.disableSubmitButton();
        }
      });
      console.log('Turnstile widget created with ID:', this.turnstileWidgetId);
    } catch (error) {
      console.error('Error setting up Turnstile:', error);
      this.showTurnstileError();
    }
  }

  showTurnstileError() {
    const turnstileContainer = this.form.querySelector('.turnstile-container');
    if (turnstileContainer) {
      turnstileContainer.innerHTML = '<p style="color: #d32f2f; text-align: center; font-size: 0.9em;">Security verification failed to load. Please try refreshing the page.</p>';
    }
  }

  setupFormHandler() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time email validation
    const emailInput = this.form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        this.clearMessages();
        this.validateEmail(emailInput.value);
      });
    }
  }

  async handleSubmit() {
    if (this.isSubmitting) return;

    const emailInput = this.form.querySelector('input[name="email"]');
    const email = emailInput?.value?.trim();

    // Validate email
    if (!email) {
      this.showMessage('Please enter your email address.', 'error');
      emailInput?.focus();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showMessage('Please enter a valid email address.', 'error');
      emailInput?.focus();
      return;
    }

    // Ensure Turnstile is loaded before checking token
    if (!this.turnstileLoaded) {
      this.showMessage('Please wait for security verification to load, then try again.', 'error');
      return;
    }

    // Get Turnstile token
    const turnstileToken = this.getTurnstileToken();
    if (!turnstileToken) {
      this.showMessage('Please complete the security verification.', 'error');
      return;
    }

    await this.submitSubscription(email, turnstileToken);
  }

  getTurnstileToken() {
    if (this.turnstileWidgetId !== null && window.turnstile) {
      return window.turnstile.getResponse(this.turnstileWidgetId);
    }
    return null;
  }

  async submitSubscription(email, turnstileToken) {
    this.setSubmittingState(true);

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          turnstileToken: turnstileToken
        })
      });

      const result = await response.json();

      if (result.success) {
        // Show brief success message then redirect
        this.showMessage('✅ Success! Redirecting...', 'success');

        // Optional: Store email in sessionStorage for success page personalization
        if (typeof(Storage) !== "undefined") {
          sessionStorage.setItem('newsletter_email', email);
          sessionStorage.setItem('newsletter_subscribed_at', new Date().toISOString());
        }

        // Redirect to success page after short delay
        setTimeout(() => {
          window.location.href = 'https://www.rnwolf.net/newsletter_next/';
        }, 1000);

      } else {
        this.showMessage(result.message, 'error');
        if (result.troubleshootingUrl) {
          this.showTroubleshootingLink(result.troubleshootingUrl);
        }
        this.resetTurnstile();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error');
      this.resetTurnstile();
    } finally {
      this.setSubmittingState(false);
    }
  }

  setSubmittingState(submitting) {
    this.isSubmitting = submitting;
    const submitButton = this.form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = submitting;
      submitButton.textContent = submitting ? 'Subscribing...' : 'Subscribe to Newsletter';
    }
  }

  enableSubmitButton() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton && !this.isSubmitting) {
      submitButton.disabled = false;
    }
  }

  disableSubmitButton() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }
  }

  resetTurnstile() {
    if (this.turnstileWidgetId !== null && window.turnstile) {
      window.turnstile.reset(this.turnstileWidgetId);
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validateEmail(email) {
    const emailInput = this.form.querySelector('input[name="email"]');
    if (!emailInput) return;

    if (email && !this.isValidEmail(email)) {
      emailInput.setCustomValidity('Please enter a valid email address');
    } else {
      emailInput.setCustomValidity('');
    }
  }

  showMessage(message, type = 'info') {
    const messageContainer = this.form.querySelector('.newsletter-message');
    if (!messageContainer) return;

    messageContainer.innerHTML = `
      <div class="alert alert-${type}">
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}
      </div>
    `;
    messageContainer.style.display = 'block';
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showTroubleshootingLink(url) {
    const messageContainer = this.form.querySelector('.newsletter-message');
    if (!messageContainer) return;

    const existingContent = messageContainer.innerHTML;
    messageContainer.innerHTML = existingContent + `
      <p><a href="${url}" target="_blank" rel="noopener">Troubleshooting Guide</a></p>
    `;
  }

  clearMessages() {
    const messageContainer = this.form.querySelector('.newsletter-message');
    if (messageContainer) {
      messageContainer.style.display = 'none';
      messageContainer.innerHTML = '';
    }
  }
}

// Auto-initialize newsletter forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize any newsletter forms on the page
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach((form, index) => {
    new NewsletterForm(form.id || `newsletter-form-${index}`, {
      apiUrl: 'https://api.rnwolf.net/v1/newsletter/subscribe',
      siteKey: '0x4AAAAAABf2ybtKSU3JJ7bC' // Replace with your actual site key
    });
  });
});