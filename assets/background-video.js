(function() {
  document.addEventListener('DOMContentLoaded', () => {
      const videoElements = document.querySelectorAll('.video-js.myVideo');
      console.log(videoElements);
    videoElements.forEach(videoElement => {
      const player = videojs(videoElement.id, {
        autoplay: false,
        muted: true,
        loop: true,
        controls: false,
        fluid: false,
        fill: true,
        responsive: true
      });

      player.ready(() => {
        player.loop(true);
        player.play().catch(error => {
          console.log("Autoplay blocked:", error);
        });
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          player.play().catch(error => {
            console.log("Playback failed on visibility change:", error);
          });
        }
      });

      if (Shopify.designMode) {
        document.addEventListener('shopify:section:load', (event) => {
          if (event.target.contains(videoElement)) {
            player.play().catch(error => {
              console.log("Playback failed after section load:", error);
            });
          }
        });
      }
    });
  });
})(); 