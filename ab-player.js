const players = document.querySelectorAll('.player__wrapper');
initializePlayers(players);

function initializePlayers(players) {
  players.forEach((player) => {
    /* ===== Theme helpers ===== */
    const setLight = () => { player.classList.add('light'); player.classList.remove('dark'); };
    const setDark  = () => { player.classList.add('dark');  player.classList.remove('light'); };
    setLight(); // start light (Before)

    /* ===== Audio elements ===== */
    const soundA = document.createElement('audio');
    soundA.src = player.getAttribute('data-audio-a'); soundA.preload = 'auto'; soundA.hidden = true;
    document.body.append(soundA);

    const soundB = document.createElement('audio');
    soundB.src = player.getAttribute('data-audio-b'); soundB.preload = 'auto'; soundB.hidden = true;
    document.body.append(soundB);

    /* ===== UI elements ===== */
    const aButton     = player.querySelector('.a__button');
    const bButton     = player.querySelector('.b__button');
    const playButton  = player.querySelector('.play__button');
    const stopButton  = player.querySelector('.stop__button');
    const progressEl  = player.querySelector('.progress') || player.querySelector('.progress__container');
    const progressBar = player.querySelector('.progress__bar');
    const progressFill= player.querySelector('.progress__fill') || progressBar;

    /* ===== Icons (inline colors) ===== */
    const playIcon  = '<i class="fa-solid fa-play"  style="color:#8A4FFF;"></i>';
    const pauseIcon = '<i class="fa-solid fa-pause" style="color:#8A4FFF;"></i>';
    const stopIcon  = '<i class="fa-solid fa-stop"  style="color:#C74A4A;"></i>';

    // Allow mobile to hit play early
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      playButton.disabled = false;
    }

    // Loading state
    let readyA = false, readyB = false;
    soundA.addEventListener('canplaythrough', () => { if (!readyA){ readyA = true; audioIsReady(); }});
    soundB.addEventListener('canplaythrough', () => { if (!readyB){ readyB = true; audioIsReady(); }});

    function audioIsReady(){
      if (readyA && readyB) {
        aButton.removeAttribute('disabled');
        bButton.removeAttribute('disabled');
        playButton.removeAttribute('disabled');
        stopButton.setAttribute('disabled','');
        // ensure icons
        playButton.innerHTML = playIcon;
        stopButton.innerHTML = stopIcon;
        // initial state: Before is active
        setPressed(aButton, true);
        setPressed(bButton, false);
      }
    }

    /* ===== A11y pressed helpers ===== */
    const setPressed = (btn, pressed) => btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');

    /* ===== Seek ===== */
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
        const tA = soundA.currentTime, tB = soundB.currentTime;
        if (tA >= tB) {
          soundA.play();
          setLight(); setPressed(aButton,true); setPressed(bButton,false);
        } else {
          soundB.play();
          setDark();  setPressed(aButton,false); setPressed(bButton,true);
        }
        stopButton.removeAttribute('disabled');
        playButton.innerHTML = pauseIcon;
      } else {
        soundA.pause(); soundB.pause();
        playButton.innerHTML = playIcon;
      }
    }

    /* ===== Button handlers ===== */
    aButton.addEventListener('click', () => {
      // make Before active, keep After clickable
      soundB.pause();
      if (soundB.currentTime > 0) soundA.currentTime = soundB.currentTime;
      soundA.play();
      setLight(); setPressed(aButton,true); setPressed(bButton,false);
      playButton.innerHTML = pauseIcon;
      stopButton.removeAttribute('disabled');
    });

    bButton.addEventListener('click', () => {
      // make After active, keep Before clickable
      soundA.pause();
      if (soundA.currentTime > 0) soundB.currentTime = soundA.currentTime;
      soundB.play();
      setDark(); setPressed(aButton,false); setPressed(bButton,true);
      playButton.innerHTML = pauseIcon;
      stopButton.removeAttribute('disabled');
    });

    playButton.addEventListener('click', () => {
      // pause other players
      document.querySelectorAll('audio').forEach(a => {
        if (a !== soundA && a !== soundB) a.pause();
      });
      document.querySelectorAll('.play__button').forEach(btn => {
        if (btn !== playButton) btn.innerHTML = playIcon;
      });
      playPause();
    });

    stopButton.addEventListener('click', () => {
      soundA.pause(); soundB.pause();
      soundA.currentTime = 0; soundB.currentTime = 0;
      progressFill.style.width = '0%';
      setLight(); setPressed(aButton,true); setPressed(bButton,false);
      playButton.innerHTML = playIcon;
      stopButton.setAttribute('disabled','');
    });

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
  });
}
