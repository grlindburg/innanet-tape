(function() {
  function initializeProductHover() {
    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);

    function handleViewportChange() {
      if (window.innerWidth > 768) {
        attachHoverEventListeners();
      } else {
        attachSwipeEventListeners();
      }
    }

    function attachHoverEventListeners() {
      const productContainers = document.querySelectorAll('.collection-product-container');
      productContainers.forEach(container => {
        container.addEventListener('mouseover', handleProductHover);
        container.addEventListener('mouseout', handleProductHoverOut);
      });
    } 

    function attachSwipeEventListeners() {
      const productContainers = document.querySelectorAll('.collection-product-container');
      productContainers.forEach(container => {
        let startX = null;
        let startY = null;

        container.addEventListener('touchstart', event => {
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        });

        container.addEventListener('touchend', event => {
          const endX = event.changedTouches[0].clientX;
          const endY = event.changedTouches[0].clientY;
          const deltaX = endX - startX;
          const deltaY = Math.abs(endY - startY);

          if (deltaX > 50 && deltaY < 20) {
            showPreviousImage(container);
          } else if (deltaX < -50 && deltaY < 20) {
            showNextImage(container);
          }
        });
      });
    }

    function playVideo(videoElement) {
      if (!videoElement) return;

      if (videoElement.tagName === 'VIDEO') {
        videoElement.play().catch(err => console.log('Video play failed:', err));
      } else if (videoElement.tagName === 'IFRAME') {
        const externalType = videoElement.dataset.externalVideo;
        if (externalType === 'youtube') {
          const src = videoElement.src;
          if (!src.includes('autoplay=1')) {
            videoElement.src = src.replace('autoplay=0', 'autoplay=1');
          }
        } else if (externalType === 'vimeo') {
          const src = videoElement.src;
          if (!src.includes('autoplay=1')) {
            videoElement.src = src.replace('autoplay=0', 'autoplay=1');
          }
        }
      }
    }

    function pauseVideo(videoElement) {
      if (!videoElement) return;

      if (videoElement.tagName === 'VIDEO') {
        videoElement.pause();
        videoElement.currentTime = 0;
      } else if (videoElement.tagName === 'IFRAME') {
        const externalType = videoElement.dataset.externalVideo;
        if (externalType === 'youtube') {
          const src = videoElement.src;
          videoElement.src = src.replace('autoplay=1', 'autoplay=0');
        } else if (externalType === 'vimeo') {
          const src = videoElement.src;
          videoElement.src = src.replace('autoplay=1', 'autoplay=0');
        }
      }
    }

    function handleProductHover(event) {
      const mainImage = event.currentTarget.querySelector('.product-image');
      const hoverMedia = event.currentTarget.querySelector('.product-image-hover');

      if (mainImage) {
        mainImage.style.opacity = '0';
      }

      if (hoverMedia) {
        hoverMedia.style.opacity = '1';
        if (hoverMedia.dataset.videoElement) {
          playVideo(hoverMedia);
        }
      }
    }

    function handleProductHoverOut(event) {
      const mainImage = event.currentTarget.querySelector('.product-image');
      const hoverMedia = event.currentTarget.querySelector('.product-image-hover');

      if (mainImage) {
        mainImage.style.opacity = '1';
      }

      if (hoverMedia) {
        hoverMedia.style.opacity = '0';
        if (hoverMedia.dataset.videoElement) {
          pauseVideo(hoverMedia);
        }
      }
    }

    function showPreviousImage(container) {
      const mainImage = container.querySelector('.product-image');
      const hoverMedia = container.querySelector('.product-image-hover');

      if (mainImage) {
        mainImage.style.opacity = '1';
      }

      if (hoverMedia) {
        hoverMedia.style.opacity = '0';
        if (hoverMedia.dataset.videoElement) {
          pauseVideo(hoverMedia);
        }
      }
    }

    function showNextImage(container) {
      const mainImage = container.querySelector('.product-image');
      const hoverMedia = container.querySelector('.product-image-hover');

      if (mainImage) {
        mainImage.style.opacity = '0';
      }

      if (hoverMedia) {
        hoverMedia.style.opacity = '1';
        if (hoverMedia.dataset.videoElement) {
          playVideo(hoverMedia);
        }
      }
    }
  }

  window.initializeProductHover = initializeProductHover;

  // Call the function on initial load
  document.addEventListener('DOMContentLoaded', initializeProductHover);
})();
