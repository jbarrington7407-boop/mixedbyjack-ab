let players = document.querySelectorAll('.player__wrapper');

initializePlayers(players);

function initializePlayers(players) {
  players.forEach((player) => {
    /* ========= THEME HELPERS ========= */
    function setLight(el) { el.classList.add('light'); el.classList.remove('dark'); }
    function setDark(el)  { el.classList.add('dark');  el.classList.remove('light'); }
    // Start in light mode (Before)
    setLight(player);

    //Set up audio elements
    var soundA = document.createElement('audio');
    soundA.src = player.getAttribute('data-audio-a');
    soundA.preload = 'auto';
    soundA.setAttribute('hidden', 'true');
    document.body.append(soundA);

    var soundB = document.createElement('audio');
    soundB.src = player.getAttribute('data-audio-b');
    soundB.preload = 'auto';
    soundB.setAttribute('hidden', 'true');
    document.body.append(soundB);

    //Get button elements
    const aButton = player.querySelector('.a__button');
    const bButton = player.querySelector('.b__button');
    const playButton = player.querySelector('.play__button');
    const stopButton = player.querySelector('.stop__button');
    const progressBar = player.querySelector('.progress__bar');
    const progressFill = player.querySelector('.progress__fill');

    // Icons (colored inline for reliability)
    const playIcon  = '<i class="fa-solid fa-play"  style="color:#8A4FFF;"></i>';
    const pauseIcon = '<i class="fa-solid fa-pause" style="color:#8A4FFF;"></i>';
    const stopIcon  = '<i class="fa-solid fa-stop"  style="color:#C74A4A;"></i>';

    //Check for mobile to enable audio playback without waiting for download status.
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      playButton.disabled = false;
    }

    //Default loading state for each sound
    var soundAReady = false;
    var soundBReady = false;

    //When audio can play through (loaded), run the function to enable buttons
    soundA.oncanplaythrough = function () {
      if (!soundAReady) {
        soundAReady = true;
        audioIsReady();
      }
    };
    soundB.oncanplaythrough = function () {
      if (!soundBReady) {
        soundBReady = true;
        audioIsReady();
      }
    };

    // Check if both A & B are ready and enable the correct buttons
    function audioIsReady() {
      if (soundAReady && soundBReady) {
        // console.log('...audio loaded!');
        aButton.disabled = false;
        playButton.disabled = false;
        // ensure initial icons are present
        if (!playButton.innerHTML.trim()) playButton.innerHTML = playIcon;
        if (!stopButton.innerHTML.trim()) stopButton.innerHTML = stopIcon;
      } else {
        // console.log('Audio loading...');
      }
    }

    // Robust progress element selection (supports either class)
    const progress = player.querySelector('.progress') || player.querySelector('.progress__container');

    // Listen for click on entire progress bar div (to allow skipping ahead)
    if (progress) {
      progress.addEventListener('click', function (event) {
        var rect = this.getBoundingClientRect();
        var percentage = (event.clientX - rect.left) / this.offsetWidth;
        percentage = Math.min(Math.max(percentage, 0), 1);
        // Keep A and B aligned
        const targetTime = percentage * (soundA.duration || soundB.duration || 0);
        soundA.currentTime = targetTime;
        soundB.currentTime = targetTime;
      });
    }

    //Play/Stop correct audio and toggle A/B, Play/Pause, and Stop buttons
    function playPause() {
      if (soundA.paused & soundB.paused) {
        // Decide which to start from whichever is ahead, then set theme accordingly
        let soundATime = soundA.currentTime;
        let soundBTime = soundB.currentTime;
        if (soundATime >= soundBTime) {
          soundA.play();
          setLight(player); // Before
          bButton.disabled = false;
          aButton.disabled = true;
          playButton.innerHTML = pauseIcon;
        } else {
          soundB.play();
          setDark(player); // After
          bButton.disabled = true;
          aButton.disabled = false;
          playButton.innerHTML = pauseIcon;
        }
        stopButton.disabled = false;
      } else {
        playButton.innerHTML = playIcon;
        soundA.pause();
        soundB.pause();
      }
    }

    aButton.addEventListener('click', (e) => {
      pauseAll();
      playButton.innerHTML = pauseIcon;
      aButton.disabled = true;
      bButton.disabled = false;
      stopButton.disabled = false;
      // keep times aligned and set light theme
      if (soundB.currentTime > 0) {
        soundA.currentTime = soundB.currentTime;
      }
      setLight(player);
      soundA.play();
      soundB.pause();
    });

    bButton.addEventListener('click', (e) => {
      pauseAll();
      playButton.innerHTML = pauseIcon;
      bButton.disabled = true;
      aButton.disabled = false;
      stopButton.disabled = false;
      // keep times aligned and set dark theme
      if (soundA.currentTime > 0) {
        soundB.currentTime = soundA.currentTime;
      }
      setDark(player);
      soundB.play();
      soundA.pause();
    });

    playButton.addEventListener('click', (e) => {
      let allAudio = document.querySelectorAll('audio');
      let allButtons = document.querySelectorAll('.play__button');
      for (let i = 0; i < allAudio.length; i++) {
        if (allAudio[i] !== soundA && allAudio[i] !== soundB) {
          allAudio[i].pause();
        }
      }
      for (let i = 0; i < allButtons.length; i++) {
        if (allButtons[i] !== playButton) {
          allButtons[i].innerHTML = playIcon;
        }
      }
      playPause();
    });

    stopButton.addEventListener('click', (e) => {
      stopSounds();
    });

    soundA.addEventListener('playing', (e) => {
      // console.log('playing a');
      progressFill.style.width =
        ((soundA.currentTime / soundA.duration) * 100 || 0) + '%';
      requestAnimationFrame(stepA);
    });

    soundB.addEventListener('playing', (e) => {
      // console.log('playing b');
      progressFill.style.width =
        ((soundB.currentTime / soundB.duration) * 100 || 0) + '%';
      requestAnimationFrame(stepB);
    });

    const stopSounds = () => {
      playButton.innerHTML = playIcon;
      aButton.disabled = false;
      bButton.disabled = true;
      playButton.disabled = false;
      stopButton.disabled = true;
      soundA.pause();
      soundA.currentTime = 0;
      soundB.pause();
      soundB.currentTime = 0;
      // Return to light theme on stop
      setLight(player);
    };

    function pauseAll() {
      let allAudio = document.querySelectorAll('audio');
      allAudio.forEach((audio) => {
        audio.pause();
      });
      document.querySelectorAll('.play__button').forEach((button) => {
        button.innerHTML = playIcon;
      });
    }

    //Frame animations for progress bar fill - converts to CSS percentage
    function stepA() {
      progressFill.style.width =
        ((soundA.currentTime / soundA.duration) * 100 || 0) + '%';
      requestAnimationFrame(stepA);
    }
    function stepB() {
      progressFill.style.width =
        ((soundB.currentTime / soundB.duration) * 100 || 0) + '%';
      requestAnimationFrame(stepB);
    }
  });
}
