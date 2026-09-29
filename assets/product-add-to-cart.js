document.addEventListener('DOMContentLoaded', function() {
  const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');

  addToCartForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const submitButton = form.querySelector('input[type="submit"]');
      submitButton.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: form.querySelector('input[name="id"]').value,
            quantity: 1
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 422) {
          throw new Error(data.description);
        }
        
        // After successful add, fetch the updated cart
        return fetch('/cart.js');
      })
      .then(response => response.json())
      .then(cart => {
        // Dispatch our custom event with the cart data
        document.dispatchEvent(new CustomEvent('cart:change', { 
          detail: cart 
        }));
        
        if (window.updateCart) {
          window.updateCart();
        }
        if (window.openCartDrawer) {
          window.openCartDrawer();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const form = document.querySelector('form[action="/cart/add"]');
        const productTitle = document.querySelector('.product-title').textContent;
        const variantSelectors = form.querySelectorAll('.variant-select');
        const variantOptions = Array.from(variantSelectors).map(select => select.value).join(' / ');
        
        // Create and show popup message
        const popup = document.createElement('div');
        popup.className = 'cart-popup-message';
        popup.innerHTML = `
          <div class="cart-popup-content">
            <p>Sorry, ${productTitle} - ${variantOptions} is no longer available.</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
          </div>
        `;
        document.body.appendChild(popup);
        
        // Add styles for the popup
        const style = document.createElement('style');
        style.textContent = `
          .cart-popup-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .cart-popup-content {
            background: white;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            max-width: 90%;
            width: 400px;
          }
          .cart-popup-content button {
            margin-top: 15px;
            padding: 8px 20px;
            background: #000;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .cart-popup-content button:hover {
            opacity: 0.9;
          }
        `;
        document.head.appendChild(style);
      })
      .finally(() => {
        submitButton.disabled = false;
      });
    });
  });

  // Handle variant changes
  const variantSelectors = document.querySelectorAll('.variant-select');
  if (variantSelectors.length) {
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', function() {
        const form = this.closest('form');
        const selectedOptions = Array.from(variantSelectors).map(select => select.value);
        
        // Find the variant that matches all selected options
        const variant = window.product.variants.find(variant => {
          return JSON.stringify(variant.options) === JSON.stringify(selectedOptions);
        });

        if (variant) {
          // Update the hidden input
          form.querySelector('input[name="id"]').value = variant.id;
          
          // Update price
          const priceElement = document.querySelector('.current-price');
          if (priceElement) {
            priceElement.textContent = formatMoney(variant.price);
          }

          // Update availability
          const submitButton = form.querySelector('input[type="submit"]');
          if (submitButton) {
            submitButton.disabled = !variant.available;
            submitButton.value = variant.available ? 
              'Add to Cart' : 
              'Sold Out';
          }
        }
      });
    });
  }
});

// Helper function to format money
function formatMoney(cents) {
  // Get the store's money format from Shopify settings
  const moneyFormat = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : "{{ shop.money_format }}";
  
  // Use Shopify's money formatting
  if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
    return Shopify.formatMoney(cents, moneyFormat);
  }
  
  // Fallback if Shopify.formatMoney is not available
  return (cents/100).toLocaleString(Shopify.locale || 'en-US', {
    style: 'currency',
    currency: Shopify.currency ? Shopify.currency.active : 'USD'
  });
}