/**
 * External Product Redirect Handler
 * Redirects clicks on external-link products to their respective URLs
 */

(function() {
  'use strict';

  // External product URL mappings (product title keywords → target URL)
  var EXTERNAL_PRODUCTS = [
    {
      match: function(title) { return title.includes('sundiata') && title.includes('digital'); },
      hrefMatch: 'sundiata',
      url: 'https://sundiata.vicmensa.com/'
    },
    {
      match: function(title) { return title.includes('substack') && title.includes('subscription'); },
      hrefMatch: 'substack',
      url: 'https://vicmensa.substack.com/subscribe?utm_source=menu&simple=true&next=https%3A%2F%2Fvicmensa.substack.com%2F'
    },
    {
      match: function(title) { return title.includes('halfrican') && title.includes('kickstarter'); },
      hrefMatch: 'halfrican',
      url: 'https://kickstarter.com/projects/halfricanshow/halfrican'
    }
  ];

  function getExternalUrl(productTitle, href) {
    for (var i = 0; i < EXTERNAL_PRODUCTS.length; i++) {
      var product = EXTERNAL_PRODUCTS[i];
      if (productTitle && product.match(productTitle)) {
        return product.url;
      }
    }
    // Fallback: check href if no title match
    if (href) {
      for (var j = 0; j < EXTERNAL_PRODUCTS.length; j++) {
        if (href.includes(EXTERNAL_PRODUCTS[j].hrefMatch)) {
          return EXTERNAL_PRODUCTS[j].url;
        }
      }
    }
    return null;
  }

  // Wait for jQuery to be loaded
  function initExternalRedirects() {
    if (typeof jQuery === 'undefined') {
      setTimeout(initExternalRedirects, 100);
      return;
    }

    jQuery(document).ready(function($) {
      // Handle clicks on product cards in collection-display section and collection pages
      $(document).on('click', '.collection-display-row__link, .product-card-wrapper a, .product-item a', function(e) {
        var $link = $(this);
        var productTitle = '';

        // Try different methods to get the product title
        // Method 1: From title element in collection-display-row
        var $titleElement = $link.find('.collection-display-row__title');
        if ($titleElement.length) {
          productTitle = $titleElement.text().trim().toLowerCase();
        }

        // Method 2: From product title in other layouts
        if (!productTitle) {
          $titleElement = $link.find('.product-title, .product-card__title, h3');
          if ($titleElement.length) {
            productTitle = $titleElement.text().trim().toLowerCase();
          }
        }

        // Method 3: From data attribute if available
        if (!productTitle && $link.data('product-title')) {
          productTitle = $link.data('product-title').toString().toLowerCase();
        }

        var href = $link.attr('href') || '';

        // Method 4: If no title found, pass null to let href matching work
        var redirectUrl = getExternalUrl(productTitle || null, href);

        if (redirectUrl) {
          e.preventDefault();
          e.stopPropagation();
          window.open(redirectUrl, '_blank', 'noopener,noreferrer');
          return false;
        }
      });

      // Also handle quick-add buttons to prevent adding to cart
      $(document).on('click', '.quick-add-btn', function(e) {
        var $btn = $(this);
        var productTitle = $btn.data('product-title') || '';

        if (typeof productTitle === 'string') {
          productTitle = productTitle.toLowerCase();

          var redirectUrl = getExternalUrl(productTitle, null);
          if (redirectUrl) {
            e.preventDefault();
            e.stopPropagation();
            window.open(redirectUrl, '_blank', 'noopener,noreferrer');
            return false;
          }
        }
      });

      console.log('External product redirect handler initialized');
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExternalRedirects);
  } else {
    initExternalRedirects();
  }
})();
