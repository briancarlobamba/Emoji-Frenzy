// === NEON THEMED EMOJI FRENZY GAME SCRIPT ===

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

const startBtn = document.getElementById('start-button');
const pauseBtn = document.getElementById('pause-button');
const resumeBtn = document.getElementById('resume-button');
const stopBtn = document.getElementById('stop-button');
const playAgainBtn = document.getElementById('play-again');
const difficultyBtns = document.querySelectorAll('.diff-btn');

const hitSound = document.getElementById('hit-sound');
const gameoverSound = document.getElementById('gameover-sound');
const comboSound = document.getElementById('combo-sound');
const countdownSound = document.getElementById('countdown-sound');
const specialSound = document.getElementById('special-sound');
const bgMusic = document.getElementById('bg-music');
const comboCountDisplay = document.getElementById('combo-count');

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let timeLeft = 30;
let gameTimer = null;
let gameSpeed = 1000;
let gamePaused = false;
let gameRunning = false;
let timeUp = false;
let comboCount = 0;
let lastPortal;
let slowMotionTimeout = null;

const creatureSet = ['👾', '👽', '🤖', '💀', '🛸', '🔮'];
const bonusCreature = '⚡';
const bombCreature = '💣';

highScoreDisplay.textContent = highScore;
setDifficulty(document.querySelector('.diff-btn.active'));
updateUIState('preStart');

function flashScreen(color = 'red') {
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.top = 0;
  flash.style.left = 0;
  flash.style.width = '100vw';
  flash.style.height = '100vh';
  flash.style.backgroundColor = color;
  flash.style.opacity = '0.3';
  flash.style.zIndex = 9999;
  flash.style.pointerEvents = 'none';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 150);
}

function activateSlowMotion(duration = 3000) {
  document.body.style.transition = 'filter 0.2s ease';
  document.body.style.filter = 'brightness(1.2) contrast(1.5)';
  gameSpeed /= 2;
  clearTimeout(slowMotionTimeout);
  slowMotionTimeout = setTimeout(() => {
    gameSpeed *= 2;
    document.body.style.filter = '';
  }, duration);
}

function randomPortal() {
  const idx = Math.floor(Math.random() * portals.length);
  const portal = portals[idx];
  return portal === lastPortal ? randomPortal() : (lastPortal = portal);
}

function randomCreature() {
  const rand = Math.random();
  if (rand < 0.1) return bonusCreature;
  if (rand < 0.15) return bombCreature;
  return creatureSet[Math.floor(Math.random() * creatureSet.length)];
}

function showCreature() {
  if (timeUp || gamePaused) return;

  const difficultyFactor = getDifficultyFactor();
  const showTime = 800 / difficultyFactor;

  const portal = randomPortal();
  const creature = portal.querySelector('.creature');
  creature.textContent = randomCreature();
  creature.classList.remove('hit');
  creature.style.top = '10%';

  setTimeout(() => {
    const isVisible = creature.getBoundingClientRect().top < portal.getBoundingClientRect().bottom;
    if (isVisible && !creature.classList.contains('hit')) {
      creature.style.top = '100%';
      resetCombo();
    }
    if (!timeUp && !gamePaused) setTimeout(showCreature, 150);
  }, showTime);
}

function getDifficultyFactor() {
  const level = document.querySelector('.diff-btn.active').dataset.diff;
  const base = level === 'easy' ? 1 : level === 'medium' ? 1.3 : 1.6;
  return base * (1 + score / 50);
}

function updateScore(value) {
  score += value;
  score = Math.max(0, score);
  scoreDisplay.textContent = score;
}

function incrementCombo() {
  comboCount++;
  comboCountDisplay.textContent = comboCount;
  comboCountDisplay.classList.add('combo-pulse');
  setTimeout(() => comboCountDisplay.classList.remove('combo-pulse'), 300);
  
  streakBar.style.width = `${Math.min(comboCount * 10, 100)}%`;
  if (comboCount % 5 === 0) {
    if (comboSound) comboSound.play();
    activateSlowMotion();
  }
}

function resetCombo() {
  comboCount = 0;
  comboCountDisplay.textContent = comboCount;
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
  comboCountDisplay.textContent = comboCount;
  streakBar.style.width = '0%';
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  updateUIState('running');
  updateProgressBar();
  difficultyContainer.style.display = 'none';
  bgMusic.volume = 0.2;
  bgMusic.play();

  gameTimer = setInterval(() => {
    if (!gamePaused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      updateProgressBar();
      if (timeLeft <= 5 && countdownSound) countdownSound.play();
      if (timeLeft <= 0) stopGame(true);
    }
  }, 1000);

  showCreature();
  setTimeout(showCreature, 500);
}

function updateProgressBar() {
  const percent = (timeLeft / 30) * 100;
  progressBar.style.width = `${percent}%`;
}

function pauseGame() {
  gamePaused = true;
  updateUIState('paused');
  bgMusic.pause();
}

function resumeGame() {
  gamePaused = false;
  updateUIState('running');
  showCreature();
  bgMusic.play();
}

function stopGame(end = false) {
  clearInterval(gameTimer);
  gameRunning = false;
  gamePaused = false;
  timeUp = true;
  updateUIState('preStart');
  creatures.forEach(c => c.style.top = '100%');
  bgMusic.pause();
  bgMusic.currentTime = 0;
  difficultyContainer.style.display = 'flex';
  document.body.style.filter = '';

  if (end) {
    if (gameoverSound) gameoverSound.play();
    finalScoreDisplay.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
      highScoreDisplay.textContent = highScore;
      highScoreMessage.textContent = '🚀 New High Score!';
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

portals.forEach(portal => {
  portal.addEventListener('click', () => {
    if (!gameRunning || gamePaused || timeUp) return;
    const creature = portal.querySelector('.creature');
    const isVisible = creature.getBoundingClientRect().top < portal.getBoundingClientRect().bottom;
    if (isVisible && !creature.classList.contains('hit')) {
      creature.classList.add('hit');
      let points = 0;

      if (creature.textContent === bonusCreature) {
        points = 5;
      } else if (creature.textContent === bombCreature) {
        points = -3;
        if (specialSound) specialSound.play();
        resetCombo();
        flashScreen();
      } else {
        points = 1;
        incrementCombo();
      }

      updateScore(points);
      if (hitSound) {
        hitSound.currentTime = 0;
        hitSound.play();
      }

      creature.style.top = '100%';
    }
  });
});

difficultyBtns.forEach(btn => btn.addEventListener('click', () => {
  if (!gameRunning) setDifficulty(btn);
}));

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
stopBtn.addEventListener('click', () => stopGame(false));
playAgainBtn.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  updateUIState('preStart');
});


