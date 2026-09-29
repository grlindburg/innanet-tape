/**
 * Quick Add to Cart functionality for collection product cards
 * Handles both single and multi-variant products
 */

class QuickAdd {
  constructor() {
    this.modal = null;
    this.modalOverlay = null;
    this.modalContent = null;
    this.currentProductData = null;
    this.selectedOptions = {};
    this.init();
  }

  init() {
    // Listen for quick add button clicks
    document.addEventListener('click', (e) => {
      const quickAddBtn = e.target.closest('.quick-add-btn');
      if (quickAddBtn) {
        e.preventDefault();
        this.handleQuickAdd(quickAddBtn);
      }

      // Listen for modal close button
      if (e.target.closest('.quick-add-variant-close')) {
        this.closeVariantModal();
      }

      // Listen for overlay click
      if (e.target.closest('.quick-add-variant-overlay')) {
        this.closeVariantModal();
      }
    });

    // Close the variant modal on Escape (WCAG 2.1.2).
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.keyCode === 27) && this.modal && this.modal.classList.contains('active')) {
        this.closeVariantModal();
      }
    });

    // Get modal elements
    this.modal = document.getElementById('quick-add-variant-modal');
    this.modalOverlay = this.modal?.querySelector('.quick-add-variant-overlay');
    this.modalContent = this.modal?.querySelector('.quick-add-variant-content');
  }

  async handleQuickAdd(button) {
    // Prevent double clicks
    if (button.classList.contains('loading')) return;

    const hasVariants = button.dataset.hasVariants === 'true';
    const productId = button.dataset.productId;

    if (hasVariants) {
      // Multi-variant product: open modal
      const productData = this.getProductData(productId);
      if (productData) {
        this.openVariantModal(button, productData);
      } else {
        console.error('Product data not found for product ID:', productId);
      }
    } else {
      // Single variant product: direct add to cart
      const variantId = button.dataset.variantId;
      if (!variantId) {
        console.error('No variant ID found');
        return;
      }
      await this.addToCart(button, variantId);
    }
  }

  getProductData(productId) {
    // Find the JSON data for this product
    const dataScript = document.querySelector(`script[data-product-variants="${productId}"]`);
    if (dataScript) {
      try {
        return JSON.parse(dataScript.textContent);
      } catch (error) {
        console.error('Error parsing product data:', error);
        return null;
      }
    }
    return null;
  }

  openVariantModal(button, productData) {
    if (!this.modal) return;

    // Remember the trigger so focus can be restored on close (WCAG 2.4.3).
    this.triggerElement = button;
    this.currentProductData = productData;
    this.selectedOptions = {};

    // Populate modal with product info
    const image = this.modal.querySelector('.quick-add-variant-image');
    const title = this.modal.querySelector('.quick-add-variant-title');

    // Use first variant's image or fall back to product image
    const firstVariantImage = productData.variants[0]?.image || button.dataset.productImage || '';
    image.src = firstVariantImage;
    image.alt = button.dataset.productTitle || '';
    title.textContent = button.dataset.productTitle || '';

    // Render variant selectors
    this.renderVariantSelectors(productData);

    // Initialize with first available variant
    this.initializeDefaultSelections(productData);

    // Show modal
    this.modal.style.display = 'flex';
    this.modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      this.modal.classList.add('active');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Trap focus and put it on the first control (a11y-helpers.js).
    const dialog = this.modal.querySelector('.quick-add-variant-content') || this.modal;
    if (typeof window.trapFocus === 'function') {
      window.trapFocus(dialog, this.modal.querySelector('.quick-add-variant-close'));
    }
  }

  closeVariantModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);

    // Restore body scroll
    document.body.style.overflow = '';

    // Release focus trap and return focus to the trigger.
    if (typeof window.removeTrapFocus === 'function') {
      window.removeTrapFocus(this.triggerElement);
    }
    this.triggerElement = null;

    // Clear data
    this.currentProductData = null;
    this.selectedOptions = {};
  }

  renderVariantSelectors(productData) {
    const selectorsContainer = this.modal.querySelector('.quick-add-variant-selectors');
    selectorsContainer.innerHTML = '';

    // Create a selector for each option
    productData.options.forEach((option) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'quick-add-variant-option';

      const label = document.createElement('label');
      label.className = 'quick-add-variant-option-label';
      label.textContent = option.name;
      label.setAttribute('for', `option-${option.position}`);

      const select = document.createElement('select');
      select.className = 'quick-add-variant-option-select';
      select.id = `option-${option.position}`;
      select.dataset.optionPosition = option.position;

      // Add options
      option.values.forEach((value) => {
        const optionElement = document.createElement('option');
        optionElement.value = value;
        optionElement.textContent = value;
        select.appendChild(optionElement);
      });

      // Listen for changes
      select.addEventListener('change', (e) => {
        this.handleOptionChange(option.position, e.target.value);
      });

      optionDiv.appendChild(label);
      optionDiv.appendChild(select);
      selectorsContainer.appendChild(optionDiv);
    });

    // Setup submit button
    const submitButton = this.modal.querySelector('.quick-add-variant-submit');
    submitButton.replaceWith(submitButton.cloneNode(true)); // Remove old listeners
    const newSubmitButton = this.modal.querySelector('.quick-add-variant-submit');
    newSubmitButton.addEventListener('click', () => {
      this.handleVariantModalSubmit();
    });
  }

  initializeDefaultSelections(productData) {
    // Set initial selections to first value of each option
    productData.options.forEach((option) => {
      this.selectedOptions[option.position] = option.values[0];
    });

    // Update display
    this.updateVariantDisplay();
  }

  handleOptionChange(position, value) {
    this.selectedOptions[position] = value;
    this.updateVariantDisplay();
  }

  updateVariantDisplay() {
    if (!this.currentProductData) return;

    // Find matching variant
    const matchingVariant = this.findMatchingVariant();

    const imageElement = this.modal.querySelector('.quick-add-variant-image');
    const priceElement = this.modal.querySelector('.quick-add-variant-price');
    const submitButton = this.modal.querySelector('.quick-add-variant-submit');

    if (matchingVariant) {
      // Update image if variant has one
      if (matchingVariant.image && imageElement) {
        imageElement.src = matchingVariant.image;
      }

      // Update price
      priceElement.textContent = matchingVariant.price;

      // Update button state
      if (matchingVariant.available) {
        submitButton.disabled = false;
        submitButton.textContent = 'Add to Cart';
      } else {
        submitButton.disabled = true;
        submitButton.textContent = 'Sold Out';
      }

      // Store current variant ID on button
      submitButton.dataset.currentVariantId = matchingVariant.id;
    } else {
      // No matching variant (shouldn't happen, but handle it)
      priceElement.textContent = '';
      submitButton.disabled = true;
      submitButton.textContent = 'Unavailable';
    }

    // Update option availability
    this.updateOptionAvailability();
  }

  findMatchingVariant() {
    if (!this.currentProductData) return null;

    return this.currentProductData.variants.find((variant) => {
      const option1Match = !variant.option1 || variant.option1 === this.selectedOptions[1];
      const option2Match = !variant.option2 || variant.option2 === this.selectedOptions[2];
      const option3Match = !variant.option3 || variant.option3 === this.selectedOptions[3];
      return option1Match && option2Match && option3Match;
    });
  }

  updateOptionAvailability() {
    if (!this.currentProductData) return;

    // For each option selector, mark options as sold out if no available variant exists
    this.currentProductData.options.forEach((option) => {
      const select = this.modal.querySelector(`select[data-option-position="${option.position}"]`);
      if (!select) return;

      Array.from(select.options).forEach((optionElement) => {
        const testOptions = { ...this.selectedOptions };
        testOptions[option.position] = optionElement.value;

        // Check if any variant exists with these options and is available
        const hasAvailableVariant = this.currentProductData.variants.some((variant) => {
          const option1Match = !variant.option1 || variant.option1 === testOptions[1];
          const option2Match = !variant.option2 || variant.option2 === testOptions[2];
          const option3Match = !variant.option3 || variant.option3 === testOptions[3];
          return option1Match && option2Match && option3Match && variant.available;
        });

        if (!hasAvailableVariant) {
          optionElement.textContent = `${optionElement.value} - Sold Out`;
          optionElement.disabled = true;
        } else {
          optionElement.textContent = optionElement.value;
          optionElement.disabled = false;
        }
      });
    });
  }

  async handleVariantModalSubmit() {
    const submitButton = this.modal.querySelector('.quick-add-variant-submit');
    const variantId = submitButton.dataset.currentVariantId;

    if (!variantId) {
      console.error('No variant selected');
      return;
    }

    // Add to cart
    await this.addToCart(submitButton, variantId, true);
  }

  async addToCart(button, variantId, isModalSubmit = false) {
    // Prevent double clicks
    if (button.classList.contains('loading')) return;

    // Set loading state
    button.classList.add('loading');
    const originalText = button.textContent;
    button.textContent = button.dataset.loadingText || 'Adding...';
    button.disabled = true;

    try {
      // Add item to cart using Shopify Cart API
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1
          }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Update cart
        await this.updateCart();

        // Show success feedback
        button.textContent = button.dataset.addedText || 'Added!';
        button.classList.add('added');

        // Announce to assistive tech (WCAG 4.1.3).
        if (typeof window.announce === 'function') {
          const productName = button.dataset.productTitle || 'Item';
          window.announce(`${productName} added to cart`);
        }

        // Close modal if this was from modal
        if (isModalSubmit) {
          setTimeout(() => {
            this.closeVariantModal();
          }, 500);
        }

        // Open cart drawer
        this.openCartDrawer();

        // Reset button after delay
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('added');
        }, 2000);
      } else {
        // Handle errors (out of stock, etc.)
        throw new Error(data.description || data.message || 'Unable to add to cart');
      }
    } catch (error) {
      console.error('Quick add error:', error);

      // Show error message
      button.textContent = 'Error';
      button.classList.add('error');

      // Show error popup if available
      this.showErrorMessage(error.message);
      if (typeof window.announce === 'function') {
        window.announce(error.message, 'assertive');
      }

      // Reset button after delay
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('error');
      }, 2000);
    } finally {
      // Remove loading state
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async updateCart() {
    try {
      // Fetch updated cart
      const response = await fetch('/cart.js');
      const cart = await response.json();

      // Dispatch custom event for cart update
      document.dispatchEvent(new CustomEvent('cart:change', {
        detail: cart
      }));

      // Call global update functions if they exist
      if (window.updateCart) {
        window.updateCart();
      }

      return cart;
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  openCartDrawer() {
    // Try to open cart drawer if it exists
    if (window.openCartDrawer) {
      window.openCartDrawer();
    } else {
      // Alternative: trigger click on cart icon
      const cartDrawer = document.getElementById('cart-drawer');
      if (cartDrawer && !cartDrawer.classList.contains('open')) {
        cartDrawer.classList.add('open');
        const overlay = document.getElementById('cart-drawer-overlay');
        if (overlay) overlay.classList.add('active');
      }
    }
  }

  showErrorMessage(message) {
    // Create error popup
    const popup = document.createElement('div');
    popup.className = 'quick-add-error-popup';
    popup.innerHTML = `
      <div class="quick-add-error-content">
        <p>${message}</p>
        <button class="quick-add-error-close">OK</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Add click handler to close button
    popup.querySelector('.quick-add-error-close').addEventListener('click', () => {
      popup.remove();
    });

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 4000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickAdd();
  });
} else {
  new QuickAdd();
}
