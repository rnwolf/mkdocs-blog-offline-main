/**
 * Newsletter Subscription Form Handler
 * Integrates with Cloudflare Turnstile and newsletter API
 */

class NewsletterForm {
  constructor(formId, config = {}) {
    this.form = document.getElementById(formId);
    this.config = {
      apiUrl: config.apiUrl || 'https://api.rnwolf.net/v1/newsletter/subscribe',
      siteKey: config.siteKey || '0x4AAAAAABf2ybtKSU3JJ7bC', // Replace with actual site key
      theme: config.theme || 'auto',
      ...config
    };

    this.turnstileWidgetId = null;
    this.isSubmitting = false;

    if (this.form) {
      this.init();
    }
  }

  init() {
    // Wait for Turnstile to load
    this.waitForTurnstile().then(() => {
      this.setupTurnstile();
      this.setupFormHandler();
    });
  }

  async waitForTurnstile() {
    return new Promise((resolve) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const checkTurnstile = () => {
        if (window.turnstile) {
          resolve();
        } else {
          setTimeout(checkTurnstile, 100);
        }
      };
      checkTurnstile();
    });
  }

  setupTurnstile() {
    const turnstileContainer = this.form.querySelector('.turnstile-container');
    if (!turnstileContainer) return;

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

    // Get Turnstile token
    const turnstileToken = this.getTurnstileToken();
    if (!turnstileToken) {
      this.showMessage('Please complete the security verification.', 'error');
      return;
    }

    await this.submitSubscription(email, turnstileToken);
  }

  getTurnstileToken() {
    if (this.turnstileWidgetId !== null) {
      return window.turnstile.getResponse(this.turnstileWidgetId);
    }
    return null;
  }

async submitSubscription(email, turnstileToken) {
  this.setSubmittingState(true);

  try {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, turnstileToken: turnstileToken })
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
    if (this.turnstileWidgetId !== null) {
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
      siteKey: '0x4AAAAAABf2ybtKSU3JJ7bC' // Replace with actual site key
    });
  });
});