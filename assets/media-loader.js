// media-loader.js

// Advanced media-loader with IntersectionObserver for true lazy loading

class MediaLoader extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
    this._hasInitialized = false;
    this._createStyles();
  }

  _createStyles() {
    // Only add styles once
    if (!document.getElementById('media-loader-styles')) {
      const style = document.createElement('style');
      style.id = 'media-loader-styles';
      style.textContent = `
        /* Base styles for all media-loader images */
        media-loader {
          display: block;
          position: relative;
          overflow: hidden;
        }
        
        /* Initial state - transparent */
        media-loader:not(.in-viewport) img {
          opacity: 0 !important;
        }
        
        /* Transition for all images */
        media-loader img {
          transition: opacity 0.5s ease-in-out;
        }
        
        /* Visible state */
        media-loader.in-viewport img {
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  connectedCallback() {
    if (this._hasInitialized) return;
    this._hasInitialized = true;
    
    // Check if element is in a horizontal slider
    this.isInSlider = this.hasAttribute('data-in-slider') || 
                      this.closest('.product-slider, [data-slider], .swiper-container, .slider, .swiper-wrapper');
    
    // Initialize with a small delay to ensure DOM is ready
    setTimeout(() => this._initialize(), 10);
  }
  
  disconnectedCallback() {
    // Clean up observer when element is removed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  _initialize() {
    // Check if element is currently visible in viewport (both horizontally and vertically)
    const isInViewport = this._checkIfInViewport();
    
    // If already in viewport, mark as visible immediately
    if (isInViewport) {
      // Add class with a slight delay to ensure transition works
      setTimeout(() => {
        this.classList.add('in-viewport');
      }, 50);
    } else {
      // Otherwise, set up observer to detect when it enters viewport
      this._setupIntersectionObserver();
    }
    
    // Initialize the image
    this._initializeImage(isInViewport);
  }
  
  _checkIfInViewport() {
    const rect = this.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Check if element is visible both vertically AND horizontally
    const isVerticallyVisible = rect.top < windowHeight && rect.bottom > 0;
    const isHorizontallyVisible = rect.left < windowWidth && rect.right > 0;
    
    // For elements in sliders, be more strict about horizontal visibility
    if (this.isInSlider) {
      // Consider it visible only if at least 50% is in the viewport horizontally
      const elementWidth = rect.right - rect.left;
      const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
      const visiblePercentage = visibleWidth / elementWidth;
      
      return isVerticallyVisible && visiblePercentage >= 0.5;
    }
    
    // For normal elements, just check if any part is visible
    return isVerticallyVisible && isHorizontallyVisible;
  }
  
  _setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add class when element enters viewport
            this.classList.add('in-viewport');
            
            // Stop observing once visible
            this.observer.disconnect();
          }
        });
      }, {
        rootMargin: '50px', // 50px buffer in all directions
        threshold: 0.1 // Trigger when at least 10% visible
      });
      
      // Start observing this element
      this.observer.observe(this);
    }
  }
  
  _initializeImage(isInViewport) {
    const img = this.querySelector('img');
    if (!img) return;
    
    // Set appropriate loading attribute
    img.setAttribute('loading', isInViewport ? 'eager' : 'lazy');
    
    // Handle image load event for both eager and lazy images
    img.addEventListener('load', () => {
      // If image is already in viewport, make sure it's visible
      if (isInViewport && !this.classList.contains('in-viewport')) {
        this.classList.add('in-viewport');
      }
    });
    
    // Mark as ready
    this.setAttribute('ready', '');
  }
}

// Register the custom element
customElements.define('media-loader', MediaLoader);