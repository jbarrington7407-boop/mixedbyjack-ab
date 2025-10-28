// Find players and initialize
const players = document.querySelectorAll('.player__wrapper');
initializePlayers(players);

function initializePlayers(players) {
  players.forEach((player) => {
    /* ===== Theme helpers ===== */
    function setLight(el){ el.classList.add('light'); el.classList.remove('dark'); }
    function setDark(el){  el.classList.add('dark');  el.classList.remove('light'); }
    setLight(player); // start in light (Before)

    /* ===== Audio elements ===== */
    const soundA = document.createElement('audio');
    soundA.src = player.getAttribute('data-audio-a');
    soundA.preload = 'auto';
    soundA.hidden = true;
    document.body.append(soundA);

    const soundB = document.createElement('audio');
    soundB.src = player.getAttribute('data-audio-b');
    soundB.preload = 'auto';
    soundB.hidden = true;
    document.body.append(soundB);

    /* ===== UI elements ===== */
    const aButton     = player.querySelector('.a__button');
    const bButton     = player.querySelector('.b__button');
    const playButton  = player.querySelector('.play__button');
    const stopButton  = player.querySelector('.stop__button');
    const progressEl  = player.querySelector('.progress') || player.querySelector('.progress__container');
    const progressBar = player.querySelector('.progress__bar');   // (same as progress__fill)
    const progressFill= player.querySelector('.progress__fill') || progressBar;

    /* ===== Icons (inline colors for reliability) ===== */
    const playIcon  = '<i class="fa-solid fa-play"  style="color:#8A4FFF;"></i>';
    const pauseIcon = '<i class="fa-solid fa-pause" style="color:#8A4FFF;"></i>';
    const stopIcon  = '<i class="fa-solid fa-stop"  style="color:#C74A4A;"></i>';

    // mobile: allow pressing play before full canplaythrough
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      playButton.disabled = false;
    }

    // Loading state
    let readyA = false, readyB = false;
    soundA.addEventListener('canplaythrough', () => { if (!readyA){ readyA = true; audioIsReady(); }});
    soundB.addEventListener('canplaythrough', () => { if (!readyB){ readyB = true; audioIsReady(); }});

    function audioIsReady(){
      if (readyA && readyB) {
        aButton.disabled = false;
        playButton.disabled = false;
        // ensure icons present
        if (!playButton.innerHTML.trim()) playButton.innerHTML = playIcon;
        if (!stopButton.innerHTML.trim()) stopButton.innerHTML = stopIcon;
      }
    }

    /* ===== Seek (click progress) ===== */
    if (progressEl) {
      progressEl.addEventListener('click', (e) => {
        const rect = progressEl.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        pct = Math.min(Math.max(pct, 0), 1);
        const dur = soundA.duration || soundB.duration || 0;
        const t = pct * dur;
        soundA.currentTime = t;
        soundB.currentTime = t;
        progressFill.style.width = (pct * 100) + '%';
      });
    }

    /* ===== Play / Pause ===== */
    function playPause(){
      if (soundA.paused && soundB.paused) {
        // start whichever is ahead, and theme to match
        const tA = soundA.currentTime, tB = soundB.currentTime;
        if (tA >= tB) {
          soundA.play();
          setLight(player);
          bButton.disabled = false; aButton.disabled = true;
        } else {
          soundB.play();
          setDark(player);
          bButton.disabled = true;  aButton.disabled = false;
        }
        stopButton.disabled = false;
        playButton.innerHTML = pauseIcon;
      } else {
        soundA.pause(); soundB.pause();
        playButton.innerHTML = playIcon;
      }
    }

    /* ===== Button handlers ===== */
    aButton.addEventListener('click', () => {
      pauseAll();
      playButton.innerHTML = pauseIcon;
      aButton.disabled = true; bButton.disabled = false; stopButton.disabled = false;
      if (soundB.currentTime > 0) soundA.currentTime = soundB.currentTime;
      setLight(player);
      soundA.play(); soundB.pause();
    });

    bButton.addEventListener('click', () => {
      pauseAll();
      playButton.innerHTML = pauseIcon;
      bButton.disabled = true; aButton.disabled = false; stopButton.disabled = false;
      if (soundA.currentTime > 0) soundB.currentTime = soundA.currentTime;
      setDark(player);
      soundB.play(); soundA.pause();
    });

    playButton.addEventListener('click', () => {
      // pause any other players on page
      document.querySelectorAll('audio').forEach(a => {
        if (a !== soundA && a !== soundB) a.pause();
      });
      document.querySelectorAll('.play__button').forEach(btn => {
        if (btn !== playButton) btn.innerHTML = playIcon;
      });
      playPause();
    });

    stopButton.addEventListener('click', stopSounds);

    /* ===== Progress animation ===== */
    soundA.addEventListener('playing', () => { requestAnimationFrame(stepA); });
    soundB.addEventListener('playing', () => { requestAnimationFrame(stepB); });

    function stepA(){
      progressFill.style.width = ((soundA.currentTime / soundA.duration) * 100 || 0) + '%';
      if (!soundA.paused) requestAnimationFrame(stepA);
    }
    function stepB(){
      progressFill.style.width = ((soundB.currentTime / soundB.duration) * 100 || 0) + '%';
      if (!soundB.paused) requestAnimationFrame(stepB);
    }

    /* ===== Helpers ===== */
    function stopSounds(){
      playButton.innerHTML = playIcon;
      aButton.disabled = false; bButton.disabled = true;
      playButton.disabled = false; stopButton.disabled = true;
      soundA.pause(); soundB.pause();
      soundA.currentTime = 0; soundB.currentTime = 0;
      progressFill.style.width = '0%';
      setLight(player); // back to light theme
    }

    function pauseAll(){
      document.querySelectorAll('audio').forEach(a => a.pause());
      document.querySelectorAll('.play__button').forEach(btn => btn.innerHTML = playIcon);
    }
  });
}
