const portals = document.querySelectorAll('.portal');
const creatures = document.querySelectorAll('.creature');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const highScoreDisplay = document.getElementById('high-score');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreMessage = document.getElementById('high-score-message');
const gameOverScreen = document.querySelector('.game-over');
const progressBar = document.getElementById('progress');
const streakBar = document.getElementById('streak-bar');
const difficultyContainer = document.querySelector('.difficulty');
const comboCountDisplay = document.getElementById('combo-count');
const multiplierDisplay = document.getElementById('multiplier');
const arena = document.querySelector('.arena');

const startBtn = document.getElementById('start-button');
const pauseBtn = document.getElementById('pause-button');
const resumeBtn = document.getElementById('resume-button');
const stopBtn = document.getElementById('stop-button');
const playAgainBtn = document.getElementById('play-again');
const difficultyBtns = document.querySelectorAll('.diff-btn');
const muteBtn = document.getElementById('mute-button');

const hitSound = document.getElementById('hit-sound');
const gameoverSound = document.getElementById('gameover-sound');
const comboSound = document.getElementById('combo-sound');
const countdownSound = document.getElementById('countdown-sound');
const specialSound = document.getElementById('special-sound');
const bombSound = document.getElementById('bomb-sound');
const bgMusic = document.getElementById('bg-music');

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let timeLeft = 30;
let gameTimer = null;
let creatureTimer = null;
let gameSpeed = 1000;
let gamePaused = false;
let gameRunning = false;
let timeUp = false;
let comboCount = 0;
let scoreMultiplier = 1;
let lastPortal = null;
let slowMotionActive = false;
let slowMotionTimeout = null;
let activeCreatures = 0;
let soundsMuted = localStorage.getItem('soundsMuted') === 'true';
let arenaHeight = null;

const creatureSet = ['👾', '👽', '🤖', '🎯', '🛸', '🔮'];
const bonusCreature = '⚡';
const bombCreature = '💣';
const specialCreature = '🌟'; 

function init() {
    highScoreDisplay.textContent = highScore;
    setDifficulty(document.querySelector('.diff-btn.active'));
    updateUIState('preStart');
    updateSoundButtonState();
    
    creatures.forEach(c => {
        c.style.top = '100%'; 
    });
    
    [hitSound, gameoverSound, comboSound, countdownSound, specialSound, bombSound].forEach(sound => {
        if (sound) {
            sound.load();
            sound.volume = 0.3;
        }
    });
    
    if (bgMusic) {
        bgMusic.load();
        bgMusic.volume = 0.2;
        bgMusic.muted = soundsMuted;
    }
    
    // Force dark background for all devices, especially iPhone
    document.documentElement.style.backgroundColor = 'var(--bg-dark)';
    document.body.style.backgroundColor = 'var(--bg-dark)';
    
    // Store the initial arena height
    if (arena) {
        arenaHeight = arena.offsetHeight;
        arena.style.minHeight = `${arenaHeight}px`;
    }
    
    // Adjust body height for iPhone
    adjustBodyHeight();
    
    // Listen for orientation changes and resize events
    window.addEventListener('resize', adjustBodyHeight);
    window.addEventListener('orientationchange', adjustBodyHeight);
}

function adjustBodyHeight() {
    // Force minimum viewport height for better mobile experience
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Additional height adjustment for iPhone
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
        document.body.style.minHeight = `${window.innerHeight}px`;
        document.body.style.height = `${window.innerHeight}px`;
        
        // Extra padding at the bottom for iPhones to prevent cut-off
        document.body.style.paddingBottom = '50px';
    }
}

function flashScreen(color = 'red', duration = 150, opacity = 0.3) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = color;
    flash.style.opacity = opacity.toString();
    flash.style.zIndex = 9999;
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), duration);
}

function activateSlowMotion(duration = 3000) {
    if (slowMotionActive) return;
    
    slowMotionActive = true;
    document.body.classList.add('slow-motion');
    clearTimeout(slowMotionTimeout);
    
    const originalSpeed = gameSpeed;
    gameSpeed *= 1.5;
    
    slowMotionTimeout = setTimeout(() => {
        slowMotionActive = false;
        document.body.classList.remove('slow-motion');
        gameSpeed = originalSpeed;
    }, duration);
}

function randomPortal() {
    let availablePortals = Array.from(portals).filter(portal => {
        const creature = portal.querySelector('.creature');
        return creature.style.top === '100%' || creature.classList.contains('hit');
    });
    
    if (availablePortals.length === 0) {
        const idx = Math.floor(Math.random() * portals.length);
        return portals[idx];
    }
    
    availablePortals = availablePortals.filter(portal => portal !== lastPortal);
    if (availablePortals.length === 0) {
        const idx = Math.floor(Math.random() * portals.length);
        return portals[idx];
    }
    
    const idx = Math.floor(Math.random() * availablePortals.length);
    lastPortal = availablePortals[idx];
    return lastPortal;
}

function randomCreature() {
    const rand = Math.random();
    
    if (rand < 0.01) return specialCreature;
    
    if (rand < 0.11) return bonusCreature;
    
    const difficultyFactor = getDifficultyFactor();
    const bombChance = 0.05 + (difficultyFactor - 1) * 0.1;
    if (rand < 0.11 + bombChance) return bombCreature;
    
    return creatureSet[Math.floor(Math.random() * creatureSet.length)];
}

function showCreature() {
    if (timeUp || gamePaused) return;
    
    const difficultyFactor = getDifficultyFactor();
    const maxCreatures = Math.floor(2 + difficultyFactor);
    
    if (activeCreatures >= maxCreatures) {
        creatureTimer = setTimeout(showCreature, 150);
        return;
    }
    
    const portal = randomPortal();
    const creature = portal.querySelector('.creature');
    
    if (creature.style.top !== '100%' && !creature.classList.contains('hit')) {
        creatureTimer = setTimeout(showCreature, 100);
        return;
    }
    
    const showTime = Math.max(400, 1000 / difficultyFactor);
    
    creature.textContent = randomCreature();
    creature.classList.remove('hit');
    creature.style.top = '10%';
    activeCreatures++;

    creature.style.animation = 'bounceIn 0.6s ease';
    setTimeout(() => {
        creature.style.animation = 'none';
    }, 600);
    
    setTimeout(() => {
        if (!creature.classList.contains('hit') && creature.style.top === '10%') {
            creature.style.top = '100%';
            if (creature.textContent !== bombCreature) {
                resetCombo(); 
            }
        }
        activeCreatures--;
    }, showTime);
    
    if (!timeUp && !gamePaused) {
        const nextCreatureDelay = Math.max(150, 800 / difficultyFactor);
        creatureTimer = setTimeout(showCreature, nextCreatureDelay);
    }
}

function getDifficultyFactor() {
    const level = document.querySelector('.diff-btn.active').dataset.diff;
    const baseFactor = level === 'easy' ? 1 : level === 'medium' ? 1.5 : 2;
    
    const scoreFactor = 1 + Math.min(1, score / 100);
    
    return baseFactor * scoreFactor;
}

function getCurrentDifficulty() {
  return document.querySelector('.diff-btn.active').dataset.diff;
}

function updateScore(points, event = null) {
  const adjustedPoints = points * scoreMultiplier;
  score += adjustedPoints;
  score = Math.max(0, score);
  scoreDisplay.textContent = score;
  
  if (points !== 0 && event) { 
      const scoreIndicator = document.createElement('div');
      scoreIndicator.classList.add('floating-score');
      scoreIndicator.textContent = `${points > 0 ? '+' : ''}${adjustedPoints}`;
      scoreIndicator.style.color = points > 0 ? 'var(--accent)' : 'var(--danger)';
      
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      scoreIndicator.style.left = `${mouseX}px`;
      scoreIndicator.style.top = `${mouseY - 20}px`;
      
      document.body.appendChild(scoreIndicator);
      setTimeout(() => scoreIndicator.remove(), 800);
  }
}

function incrementCombo() {
    comboCount++;
    comboCountDisplay.textContent = comboCount;
    comboCountDisplay.classList.add('combo-pulse');
    setTimeout(() => comboCountDisplay.classList.remove('combo-pulse'), 300);
    
    const streakPercentage = Math.min(comboCount * 10, 100);
    streakBar.style.width = `${streakPercentage}%`;
    
    // Update the multiplier based on combo count
    if (comboCount >= 15) {
        scoreMultiplier = 4;
    } else if (comboCount >= 10) {
        scoreMultiplier = 3;
    } else if (comboCount >= 5) {
        scoreMultiplier = 2;
    } else {
        scoreMultiplier = 1;
    }
    multiplierDisplay.textContent = `${scoreMultiplier}x`;
    
    // Trigger special effects on milestone combos
    if (comboCount % 5 === 0) {
        if (comboSound && !soundsMuted) comboSound.play();
        flashScreen('cyan', 200, 0.2);
        activateSlowMotion(2000);
    }
}

function resetCombo() {
    comboCount = 0;
    scoreMultiplier = 1;
    comboCountDisplay.textContent = comboCount;
    multiplierDisplay.textContent = '1x';
    streakBar.style.width = '0%';
}

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    timeUp = false;
    score = 0;
    timeLeft = 30;
    comboCount = 0;
    scoreMultiplier = 1;
    comboCountDisplay.textContent = comboCount;
    multiplierDisplay.textContent = '1x';
    streakBar.style.width = '0%';
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    
    updateUIState('running');
    updateProgressBar();
    
    // Instead of hiding, make invisible but keep space
    difficultyContainer.style.visibility = 'hidden';
    difficultyContainer.style.opacity = '0';
    difficultyContainer.style.height = `${difficultyContainer.offsetHeight}px`;
    
    if (bgMusic && !soundsMuted) {
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
    
    gameTimer = setInterval(() => {
        if (!gamePaused) {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            updateProgressBar();
            
            if (timeLeft <= 5 && countdownSound && !soundsMuted) {
                countdownSound.currentTime = 0;
                countdownSound.play();
            }
            
            if (timeLeft <= 0) {
                stopGame(true);
            }
        }
    }, 1000);
    
    activeCreatures = 0;
    showCreature();
}

function updateProgressBar() {
    const percent = (timeLeft / 30) * 100;
    progressBar.style.width = `${percent}%`;
    
    if (timeLeft <= 5) {
        progressBar.classList.add('danger');
    } else {
        progressBar.classList.remove('danger');
    }
}

function pauseGame() {
    gamePaused = true;
    updateUIState('paused');
    if (bgMusic) bgMusic.pause();
}

function resumeGame() {
    gamePaused = false;
    updateUIState('running');
    if (bgMusic && !soundsMuted) bgMusic.play();
    showCreature();
}

function stopGame(end = false) {
    clearInterval(gameTimer);
    clearTimeout(creatureTimer);
    clearTimeout(slowMotionTimeout);
    
    gameRunning = false;
    gamePaused = false;
    timeUp = true;
    slowMotionActive = false;
    
    updateUIState('preStart');
    creatures.forEach(c => c.style.top = '100%');
    document.body.classList.remove('slow-motion');
    
    timeLeft = 30;
    timeDisplay.textContent = timeLeft;
    updateProgressBar();
    
    resetCombo();
    
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    
    // Restore difficulty container
    difficultyContainer.style.visibility = 'visible';
    difficultyContainer.style.opacity = '1';
    difficultyContainer.style.height = '';
    
    if (end) {
        if (gameoverSound && !soundsMuted) gameoverSound.play();
        finalScoreDisplay.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
            highScoreMessage.textContent = '🚀 New High Score!';
            flashScreen('var(--accent)', 300, 0.2);
        } else {
            highScoreMessage.textContent = '';
        }
        
        gameOverScreen.style.display = 'flex';
    }
}

function setDifficulty(btn) {
    difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const diff = btn.dataset.diff;
    gameSpeed = diff === 'easy' ? 1000 : diff === 'medium' ? 800 : 600;
}

function updateUIState(state) {
    startBtn.style.display = state === 'preStart' ? 'inline-block' : 'none';
    pauseBtn.style.display = state === 'running' ? 'inline-block' : 'none';
    resumeBtn.style.display = state === 'paused' ? 'inline-block' : 'none';
    stopBtn.style.display = state !== 'preStart' ? 'inline-block' : 'none';
    difficultyBtns.forEach(btn => btn.disabled = state !== 'preStart');
}

function toggleMute() {
    soundsMuted = !soundsMuted;
    localStorage.setItem('soundsMuted', soundsMuted);
    
    [hitSound, gameoverSound, comboSound, countdownSound, specialSound, bombSound, bgMusic].forEach(sound => {
        if (sound) sound.muted = soundsMuted;
    });
    
    updateSoundButtonState();
}

function updateSoundButtonState() {
    if (muteBtn) {
        muteBtn.textContent = soundsMuted ? '🔇' : '🔊';
        muteBtn.setAttribute('title', soundsMuted ? 'Unmute Sounds' : 'Mute Sounds');
    }
}

portals.forEach(portal => {
    portal.addEventListener('click', (event) => {
        if (!gameRunning || gamePaused || timeUp) return;
        
        const creature = portal.querySelector('.creature');
        if (!creature.classList.contains('hit') && creature.textContent !== '') {
            creature.classList.add('hit');
            let points = 0;
            
            switch (creature.textContent) {
                case specialCreature:
                    points = 10;
                    if (getCurrentDifficulty() === 'hard') {
                        points *= 2;
                    }
                    if (specialSound && !soundsMuted) specialSound.play();
                    flashScreen('var(--neon-pink)', 300, 0.2);
                    
                    // Add bonus time
                    timeLeft = Math.min(30, timeLeft + (getCurrentDifficulty() === 'hard' ? 5 : 3)); 
                    timeDisplay.textContent = timeLeft;
                    updateProgressBar();
                    incrementCombo();
                    if (getCurrentDifficulty() === 'hard') {
                        flashScreen('var(--neon-blue)', 200, 0.2); 
                    }
                    break;
                    
                case bonusCreature:
                    points = 5;
                    if (getCurrentDifficulty() === 'hard') {
                        points *= 2; 
                    }
                    if (hitSound && !soundsMuted) {
                        hitSound.playbackRate = 1.5;
                        hitSound.currentTime = 0;
                        hitSound.play();
                    }
                    incrementCombo();
                    if (getCurrentDifficulty() === 'hard') {
                        flashScreen('var(--neon-blue)', 200, 0.2); 
                    }
                    break;                  
                    
                case bombCreature:
                    points = -3;
                    if (bombSound && !soundsMuted) bombSound.play();
                    resetCombo();
                    flashScreen('var(--danger)', 200, 0.3);
                    break;
                    
                default:
                    points = 1;
                    if (hitSound && !soundsMuted) {
                        hitSound.playbackRate = 1.0;
                        hitSound.currentTime = 0;
                        hitSound.play();
                    }
                    incrementCombo();
            }
            
            updateScore(points, event);
            creature.style.top = '100%';
            activeCreatures--;
        }
    });
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gameRunning) setDifficulty(btn);
    });
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
stopBtn.addEventListener('click', () => stopGame(false));
playAgainBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    updateUIState('preStart');
});

if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
}

// After page load, force dark background and check if additional iPhone fixes are needed
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Fix for iPhone background color
    setTimeout(() => {
        document.documentElement.style.backgroundColor = 'var(--bg-dark)';
        document.body.style.backgroundColor = 'var(--bg-dark)';
        adjustBodyHeight();
    }, 100);
});

// Handle page visibility changes to maintain dark background
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        document.documentElement.style.backgroundColor = 'var(--bg-dark)';
        document.body.style.backgroundColor = 'var(--bg-dark)';
    }
});