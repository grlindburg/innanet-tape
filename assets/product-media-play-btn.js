document.querySelectorAll('.video-container').forEach(container => {
  const video = container.querySelector('video');
  const playButton = container.querySelector('.play-button');
  
  if (video && playButton) {
    playButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        video.controls = true;
        playButton.style.display = 'none';
      }
    });
  }
});