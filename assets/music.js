(function() {   
    function musicFunc() {
        const bodyElem = getComputedStyle(document.body);
        const customCursorValue = bodyElem.getPropertyValue('--custom-cursor').trim();
        const htmlElement = document.documentElement;
        if (customCursorValue !== 'none') {
            htmlElement.style.cursor = 'url(\"' + customCursorValue + '\"), auto';
        }
    
        const musicContainer = document.querySelector('.music-container');
        if (musicContainer) {
        const playBtn = document.querySelector('#play');
        const audio = document.querySelector('#audio');
        const progress = document.querySelector('.progress');
        const fileUrl = musicContainer.getAttribute('data-file-url');
        const musicImgUrl = musicContainer.getAttribute('music-image-url');
        const menu = document.querySelector('.pages-menu');
        const songBar = document.getElementById('song-bar');
        if (menu && musicContainer) {
            if (menu.getAttribute('align-menu-right') != null) {
                musicContainer.style.left = '-15px';
                musicContainer.style.right = 'auto';
                
                songBar.style.left = '240px';
                
            } else {
                musicContainer.style.left = 'auto';
                musicContainer.style.right = '-15px';
            }
        }
    
        if (window.innerWidth <= 479 && musicContainer.classList.contains('disable-music')) {
            // Disable JavaScript for mobile devices
        } else {
            const musicUrls = [
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/The_Word_-_Instrumental_V4_DJ_Mastered.m4a',
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/Still_With_The_Smoke_-_Instrumental_V3_DJ_Mastered.m4a',
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/Applebum_-_Instrumental_V1_DJ_Mastered.m4a',
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/What_We_Doin_-_Instrumental_V4_DJ_Mastered.m4a',
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/Eye_For_An_Eye_-_Instrumental_V3_DJ_Mastered.m4a',
                'https://cdn.shopify.com/s/files/1/0931/1305/7652/files/Prayed_4_-_Instrumental_V3_DJ_Mastered.m4a'
            ].filter(url => url !== '');
            let currentSongIndex = parseInt(localStorage.getItem('pjSongQueue')) || 0;

    

            if (musicUrls.length === 0) {
                return;
            }

            const trackNames = [
                'The Word - Instrumental',
                'Still With The Smoke - Instrumental',
                'Applebum - Instrumental',
                'What We Doin - Instrumental',
                'Eye For An Eye - Instrumental',
                'Prayed 4 - Instrumental'
            ];

            function loadSong() {
                if (!musicUrls[currentSongIndex]) {
                    nextSong();
                    return;
                }
                audio.src = musicUrls[currentSongIndex];
                audio.load();
                document.getElementById('current-track-name').textContent = trackNames[currentSongIndex] || 'Unknown Track';
                if (musicImgUrl) {
                    const cover = document.querySelector('#cover');
                    if (cover) {
                        cover.src = musicImgUrl;
                    } else {
                    }
                } else {
                }
    
                const savedTime = localStorage.getItem('audioTime');
                if (savedTime) {
                    audio.currentTime = parseFloat(savedTime);
                    if (localStorage.getItem('audioIsPaused') === "true") {
                        pauseSong();
                    } else {
                        musicContainer.classList.add('play');
                        playBtn.querySelector('i.fas').classList.remove('fa-play');
                        playBtn.querySelector('i.fas').classList.add('fa-pause');
                    }
                }
            }
    
            function nextSong() {
                if (musicUrls.length > 1) {
                    currentSongIndex = (currentSongIndex + 1) % musicUrls.length;
                    localStorage.setItem('pjSongQueue', currentSongIndex);
                    loadSong();
                    audio.currentTime = 0;
                    playSong();
                } else {
                    currentSongIndex = 0;
                    localStorage.setItem('pjSongQueue', currentSongIndex);
                    audio.currentTime = 0;
                    playSong();
                }
            }
    
            setInterval(function() {
                localStorage.setItem('audioTime', audio.currentTime);
            }, 500);
    
            function playSong() {
                musicContainer.classList.add('play');
                playBtn.querySelector('i.fas').classList.remove('fa-play');
                playBtn.querySelector('i.fas').classList.add('fa-pause');
                localStorage.setItem('audioIsPaused', "false");
                audio.muted = false;
                audio.play();
            }
    
            function pauseSong() {
                musicContainer.classList.remove('play');
                playBtn.querySelector('i.fas').classList.remove('fa-pause');
                playBtn.querySelector('i.fas').classList.add('fa-play');
                localStorage.setItem('audioIsPaused', "true");
                audio.muted = true;
                audio.pause();
            }
    
            function updateProgress(e) {
                const currentTime = e.srcElement.currentTime;
                const progressPercent = (currentTime / audio.duration) * 100;
                progress.style.width = `${progressPercent}%`;
            }
    
            playBtn.addEventListener('click', () => {
                const isPlaying = musicContainer.classList.contains('play');
                if (isPlaying) {
                    pauseSong();
                } else {
                    playSong();
                }
            });
    
            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener("loadedmetadata", function() {
                duration = audio.duration;
            });
            audio.addEventListener('ended', () => {
                nextSong();
            });
                function onUserInteraction() {
                if (localStorage.getItem('audioIsPaused') === "false") {
                    playSong();
                    removeInteractionListeners();
                }
            }

            loadSong();
    
            function removeInteractionListeners() {
                if (localStorage.getItem('audioIsPaused') === "true") {
                    document.removeEventListener('click', onUserInteraction);
                    document.removeEventListener('mousedown', onUserInteraction);
                    document.removeEventListener('mousemove', onUserInteraction);
                    document.removeEventListener('mouseup', onUserInteraction);
                    document.removeEventListener('touchstart', onUserInteraction);
                    document.removeEventListener('touchmove', onUserInteraction);
                    document.removeEventListener('touchend', onUserInteraction);
                }
            }
    
            document.addEventListener('click', onUserInteraction);
            document.addEventListener('mousedown', onUserInteraction);
            document.addEventListener('mousemove', onUserInteraction);
            document.addEventListener('mouseup', onUserInteraction);
            document.addEventListener('touchstart', onUserInteraction);
            document.addEventListener('touchmove', onUserInteraction);
            document.addEventListener('touchend', onUserInteraction);

            const cover = document.querySelector('#cover');
            if (cover) {
                cover.addEventListener('click', nextSong);
            } else {
            }

            const songBar = document.getElementById('song-bar');

            let hideTimeout;

            function showSongBar() {
                clearTimeout(hideTimeout);
                songBar.style.visibility = 'visible';
                songBar.classList.add('visible');
            }

            function hideSongBar() {
                hideTimeout = setTimeout(() => {
                    songBar.classList.remove('visible');
                    setTimeout(() => {
                        songBar.style.visibility = 'hidden';
                    }, 300);
                }, 2000);
            }

            const showSongBarSetting = false;

            const alwaysShowSongBarSetting = false;

            if (alwaysShowSongBarSetting) {
                songBar.style.display = 'flex';
                songBar.style.visibility = 'visible';
                songBar.classList.add('visible');
            } else {
                if (showSongBarSetting) {
                    if (cover) {
                        cover.addEventListener('mouseenter', showSongBar);
                        cover.addEventListener('mouseleave', hideSongBar);
                    }

                    playBtn.addEventListener('mouseenter', () => {
                        showSongBar();  
                    });
                    playBtn.addEventListener('mouseleave', hideSongBar);
                } else {
                    songBar.style.display = 'none';
                }
            }

            const centerSongBarSetting = false;

            if (centerSongBarSetting) {
                songBar.style.left = '50%';
                songBar.style.transform = 'translateX(-50%)';
            }
        }
    }}
    musicFunc();
    if (Shopify.designMode) {
        document.addEventListener('shopify:section:load', function(event) {
            musicFunc();
        });
    }
    })()