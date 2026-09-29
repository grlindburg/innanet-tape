var cMonth = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cMonth");
var cDay = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cDay");
var cYear = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cYear");
var cHour = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cHour");
var cMin = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cMin");
var amPm = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("cAMmPm");

cDay = cDay.padStart(2, '0');
cHour = cHour.padStart(2, '0');
cMin = cMin.padStart(2, '0');

if (amPm == "pm" && cHour !== "12") {
  cHour = String(parseInt(cHour, 10) + 12).padStart(2, '0');
}

if (amPm == "am" && cHour === "12") {
  cHour = "00";
}

var endTime = `${cMonth} ${cDay}, ${cYear} ${cHour}:${cMin}:00 UTC`
var countDownDate = new Date(endTime).getTime();

var now = new Date().getTime();
var distance = countDownDate - now;

// Check if countdown is expired before setting initial values
if (distance < 0) {
    document.getElementById("days").innerHTML = 0;
    document.getElementById("hours").innerHTML = 0;
    document.getElementById("minutes").innerHTML = 0;
    document.getElementById("seconds").innerHTML = 0;
    document.body.style.overflow = "hidden";
} else {
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;
}

window.addEventListener('load', function() {


function fadeAudio(){

const audioElement = document.getElementById('audio'); 
  if(audio){
const fadeDuration = 20000; 
const fadeInterval = 50; 
let currentVolume = audioElement.volume;
let targetVolume = 0; 
const volumeStep = (currentVolume / (fadeDuration / fadeInterval)); 

const fadeOutInterval = setInterval(() => {
  if (currentVolume > targetVolume) {
    currentVolume -= volumeStep; 
    audioElement.volume = currentVolume; 
  } else {
    audioElement.volume = targetVolume; 
    clearInterval(fadeOutInterval); 
  }
}, fadeInterval);
}
} 


var countdownMusic = document.querySelector(".music-container")

var countdownMusicUrl;

if(countdownMusic){
countdownMusicUrl = countdownMusic.getAttribute("countdown-music"); 
}

var disableCountdownAnimation = document.querySelector(".countdown-timer, .countdown-timer-2").getAttribute("disableCountdownAnimation") === 'true';

var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;
    
    if (distance < 0) {
        clearInterval(x);
        
        document.getElementById("days").innerHTML = 0;
        document.getElementById("hours").innerHTML = 0;
        document.getElementById("minutes").innerHTML = 0;
        document.getElementById("seconds").innerHTML = 0;
        
        if (!disableCountdownAnimation) {
            document.body.style.overflow = "hidden";
            
            var countDownAudio = document.getElementById("audio")
            console.log("countDownMusicUrl", countdownMusicUrl)
            if(countDownAudio){
                countDownAudio.src = countdownMusicUrl; 
                countDownAudio.currentTime = 0;
                countDownAudio.volume = 1;
            }

            var pc1 = document.querySelector(".password-information-container")
            var ct1 = document.querySelector(".countdown-timer")
            var pc2 = document.querySelector(".password-information-container-2")
            var ct2 = document.querySelector(".countdown-timer-2")

            if(pc1){
                pc1.classList.add('animate-down');
            }  
            if(ct1){
                ct1.classList.add('animate-out');
            }   
            if(pc2){
                pc2.classList.add('animate-out');
            } 
            if(ct2){
                ct2.classList.add('animate-down');
            }  

            var entrance = document.querySelector(".password-entrance")
            entrance.classList.add('show-password-entrance');
            entrance.classList.add('animate-up');
        } else {
            // If countdown animation is disabled, allow scrolling
            document.body.style.overflow = "auto";
        }
    } else {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("days").innerHTML = days;
        document.getElementById("hours").innerHTML = hours;
        document.getElementById("minutes").innerHTML = minutes;
        document.getElementById("seconds").innerHTML = seconds;
    }
}, 1000);

});

