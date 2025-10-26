let tobyImg, encantadoraImg, ninaImg, bigotesImg;
let toby, encantadora;
let platforms = [];
let falling = [];
let gameWon = false;
let gameLost = false;
let canvasW = 800, canvasH = 360;
let jumpBarkSound, fallSound, winSound;

let currentLevel = 1;
const maxLevels = 3;

const levelData = {
  // --- NIVEL 1: MÁS LARGO Y CON PLATAFORMAS MÁS PEQUEÑAS ---
  1: {
    message: "¿Pq putas tu pelo es tan lindo como el de Encantador?",
    platforms: [
      { type: 'static', x: 140, yOffset: 70, w: 80, h: 32 },
      { type: 'static', x: 260, yOffset: 120, w: 80, h: 32 },
      { type: 'static', x: 390, yOffset: 90, w: 70, h: 32 },
      { type: 'static', x: 500, yOffset: 150, w: 70, h: 32 },
      { type: 'static', x: 620, yOffset: 110, w: 60, h: 32 },
      { type: 'static', x: 710, yOffset: 140, w: 70, h: 32 }
    ]
  },
  // --- NIVEL 2: MÁS COMPLEJO CON MÁS PELIGROS Y MOVIMIENTO ---
  2: {
    message: "Aunque no me defiendas, te kiero",
    platforms: [
      { type: 'static', x: 120, yOffset: 70, w: 70, h: 32 },
      { type: 'moving', x: 220, yOffset: 130, w: 80, h: 32, startX: 220, endX: 350, speed: 1.3, dir: 1 },
      { type: 'danger', x: 400, yOffset: 80, w: 40, h: 32 },
      { type: 'static', x: 480, yOffset: 110, w: 60, h: 32 },
      { type: 'danger', x: 580, yOffset: 160, w: 40, h: 32 },
      { type: 'static', x: 650, yOffset: 120, w: 50, h: 32 },
      { type: 'static', x: 720, yOffset: 150, w: 60, h: 32 }
    ]
  },
  // --- NIVEL 3: UN RETO FINAL MÁS LARGO Y TÉCNICO ---
  3: {
    message: "Lin, entonces usted sabe que yo a veces tin, si sabe? me gusta verle sus ojitos, son cute<br><span>JSANIDHBSAIYTVY UHABGSH zxGVJCTFRXASBHHYKU</span>",
    platforms: [
      { type: 'moving', x: 120, yOffset: 70, w: 70, h: 32, startX: 120, endX: 200, speed: 1, dir: 1 },
      { type: 'danger', x: 250, yOffset: 100, w: 40, h: 32 },
      { type: 'static', x: 320, yOffset: 140, w: 50, h: 32 },
      { type: 'danger', x: 400, yOffset: 180, w: 40, h: 32 },
      { type: 'moving', x: 480, yOffset: 120, w: 70, h: 32, startX: 460, endX: 600, speed: 1.6, dir: 1 },
      { type: 'static', x: 650, yOffset: 80, w: 40, h: 32 },
      { type: 'danger', x: 620, yOffset: 200, w: 30, h: 32 },
      { type: 'static', x: 720, yOffset: 160, w: 60, h: 32 }
    ]
  }
};

function preload() {
  tobyImg = loadImage('IMG/perrito.png');
  encantadoraImg = loadImage('IMG/encantador.png');
  ninaImg = loadImage('IMG/Nina.png');
  bigotesImg = loadImage('IMG/Bigotes.png');
  
  soundFormats('mp3', 'ogg');
  jumpBarkSound = loadSound('AUDIO/Guau.mp3');
  fallSound = loadSound('AUDIO/caida.mp3');
  winSound = loadSound('AUDIO/Au.mp3');
}

function setup() {
  const canvas = createCanvas(canvasW, canvasH);
  canvas.parent('game-container');
  textFont('Quicksand');
  noStroke();
  loadLevel(currentLevel);
}

function loadLevel(level) {
  gameWon = false;
  gameLost = false;
  
  const existingOverlay = document.querySelector('.win-overlay');
  if (existingOverlay) existingOverlay.remove();

  toby = { x: 80, y: height - 60, w: 56, h: 56, vy: 0, onGround: true, dir: 1, bob: 0, hasLeftStart: false };
  
  platforms = levelData[level].platforms.map(p => {
    let platform = {...p};
    platform.y = height - platform.yOffset;
    return platform;
  });

  const lastPlatform = platforms[platforms.length - 1];
  encantadora = { x: lastPlatform.x + lastPlatform.w / 2, y: lastPlatform.y - 50, w: 76, h: 100 };

  falling = [];
  for (let i = 0; i < 15; i++) createPetal();
  
  loop();
}

function draw() {
  if (gameWon || gameLost) return;

  for (let pl of platforms) {
    if (pl.type === 'moving') {
      pl.x += pl.speed * pl.dir;
      if (pl.x > pl.endX || pl.x < pl.startX) {
        pl.dir *= -1;
      }
    }
  }

  // DIBUJO
  let skyTop = color(15, 25, 50);
  let skyBottom = color(40, 30, 70);
  for(let i = 0; i < height; i++){ let inter = map(i, 0, height, 0, 1); let c = lerpColor(skyTop, skyBottom, inter); stroke(c); line(0, i, width, i); }
  noStroke();

  // --- TÍTULO DE FONDO ---
  fill(255, 255, 255, 15); // Color blanco, muy transparente
  textSize(60);
  textAlign(CENTER, CENTER);
  text("pa la pestañona", width / 2, height / 2);
  // --- FIN DEL TÍTULO ---

  fill(25, 20, 40);
  rect(0, height - 40, width, 40);
  for (let p of falling) { p.y += p.vy; p.x += p.vx; p.angle += p.spin; push(); translate(p.x, p.y); rotate(p.angle); fill(240, 240, 255, p.alpha); ellipse(0, 0, 5, 15); ellipse(0, 0, 15, 5); pop(); if (p.y > height + 30) { p.y = -random(10, 120); p.x = random(0, width); } }
  for (let pl of platforms) { if (pl.type === 'danger') { fill(180, 40, 90); rect(pl.x, pl.y, pl.w, pl.h, 8); fill(220, 50, 120); rect(pl.x, pl.y, pl.w, 10, 8); } else { fill(60, 50, 90); rect(pl.x, pl.y, pl.w, pl.h, 8); fill(85, 70, 125); rect(pl.x, pl.y, pl.w, 10, 8); } }
  const lastPlatform = platforms[platforms.length - 1];
  const catSize = 45; const catY = lastPlatform.y - catSize / 2; const ninaX = encantadora.x - 40; const bigotesX = encantadora.x + 40;
  const drawShadow = (x, y, size) => { fill(0, 0, 0, 70); ellipse(x, y + size/2 + 2, size * 0.8, size * 0.2); };
  drawShadow(toby.x, toby.y, toby.w); drawShadow(encantadora.x, encantadora.y + 48, encantadora.w); drawShadow(ninaX, catY, catSize); drawShadow(bigotesX, catY, catSize);

  // FÍSICA
  toby.vy += 0.7; toby.y += toby.vy;
  let groundY = height - 40; toby.onGround = false;
  if (toby.y + toby.h/2 > groundY) { toby.y = groundY - toby.h/2; toby.vy = 0; toby.onGround = true; if (toby.hasLeftStart) { triggerLoss(); } }
  for (let pl of platforms) { let left = pl.x, right = pl.x + pl.w, top = pl.y; if (toby.x > left && toby.x < right && toby.y + toby.h/2 > top && toby.y + toby.h/2 < top + 20 && toby.vy > 0) { if (pl.type === 'danger') { triggerLoss(); return; } toby.y = top - toby.h/2; toby.vy = 0; toby.onGround = true; toby.hasLeftStart = true; if (pl.type === 'moving') { toby.x += pl.speed * pl.dir; } } }
  if (keyIsDown(LEFT_ARROW)) { toby.x -= 4.2; toby.dir = -1; } if (keyIsDown(RIGHT_ARROW)) { toby.x += 4.2; toby.dir = 1; }
  toby.x = constrain(toby.x, toby.w/2, width - toby.w/2); toby.bob = sin(frameCount * 0.08) * 2;

  // DIBUJAR PERSONAJES
  push(); imageMode(CENTER); image(ninaImg, ninaX, catY, catSize, catSize); image(bigotesImg, bigotesX, catY, catSize, catSize); image(encantadoraImg, encantadora.x, encantadora.y, encantadora.w, encantadora.h); pop();
  push(); translate(toby.x, toby.y + toby.bob); push(); translate(-toby.w*0.35 * toby.dir, toby.h*0.08); rotate(sin(frameCount * 0.25) * 0.6); fill(245, 200, 140); ellipse(0, 0, 16, 10); pop(); scale(toby.dir, 1); imageMode(CENTER); image(tobyImg, 0, 0, toby.w, toby.h); pop();

  // LÓGICA DE GANAR
  if (dist(toby.x, toby.y, encantadora.x, encantadora.y) < 60) {
    triggerWin();
  }

  fill(220, 220, 230, 180); textSize(12); textAlign(LEFT);
  text(`Nivel ${currentLevel}  •  ← → mover  •  espacio saltar`, 12, 18);
}

function keyPressed() {
  if ((key === ' ' || key === 'Spacebar') && toby.onGround) {
    toby.vy = -12.5; toby.onGround = false; playJump();
  }
  if (key === 'r' || key === 'R') loadLevel(currentLevel);
}

function triggerWin() {
  if (gameWon || gameLost) return;
  gameWon = true;
  playWinSound();
  noLoop();

  const isLastLevel = currentLevel === maxLevels;
  const message = levelData[currentLevel].message;
  const buttonText = isLastLevel ? "Volver a Jugar" : "Siguiente Nivel";

  const container = document.getElementById('game-container');
  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';

  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-rain';

  if (currentLevel === 1) {
    overlay.innerHTML = `
      <div class="win-screen-full">
        <div class="win-content">
            <div class="win-meme-image-container">
              <img src="IMG/encantador.png" alt="Encantador">
            </div>
            <div class="win-meme-text">${message}</div>
            <button class="btn" id="nextLevelBtn">${buttonText}</button>
        </div>
      </div>`;
    overlay.firstElementChild.prepend(particlesContainer);
    for (let i = 0; i < 30; i++) { createFallingParticle(particlesContainer, ['🌸', '💮', '🌷', '🌺', '✨']); }

  } else if (currentLevel === 2) {
    overlay.innerHTML = `
      <div class="win-screen-full level2-win">
        <div class="win-content-level2">
          <div class="character-duo">
            <div class="character-container dog-container">
              <div class="dog-hearts">
                <span class="dog-heart h1">💖</span><span class="dog-heart h2">💕</span><span class="dog-heart h3">💗</span>
              </div>
              <div class="dog-message">${message}</div>
              <img src="../IMG/perrito.png" alt="Toby" class="win-char-img dog-img">
            </div>
            <img src="../IMG/encantador.png" alt="Encantador" class="win-char-img charming-img">
          </div>
          <button class="btn" id="nextLevelBtn">${buttonText}</button>
        </div>
      </div>`;
    overlay.firstElementChild.prepend(particlesContainer);
    for (let i = 0; i < 30; i++) { createFallingParticle(particlesContainer, ['🌸', '💮', '🌷', '🌺', '✨']); }

  } else if (currentLevel === 3) {
    overlay.innerHTML = `
      <div class="win-screen-full final-win">
        <div class="win-content final-win-content">
            <div class="final-characters">
                <img src="../IMG/Nina.png" alt="Nina" class="final-char-img nina-final">
                <img src="../IMG/perrito.png" alt="Toby" class="final-char-img dog-final">
                <img src="../IMG/encantador.png" alt="Encantador" class="final-char-img charming-final">
                <img src="../IMG/Bigotes.png" alt="Bigotes" class="final-char-img bigotes-final">
            </div>
            <div class="final-win-text">${message}</div>
            <button class="btn" id="nextLevelBtn">${buttonText}</button>
        </div>
      </div>`;
    overlay.firstElementChild.prepend(particlesContainer);
    for (let i = 0; i < 25; i++) { 
        createFallingParticle(particlesContainer, ['🐾', '💖', '✨']);
    }
  }
  
  container.style.position = 'relative'; 
  container.appendChild(overlay);

  document.getElementById('nextLevelBtn').addEventListener('click', () => {
    if (isLastLevel) {
      currentLevel = 1;
      loadLevel(currentLevel);
    } else {
      currentLevel++;
      loadLevel(currentLevel);
    }
  });
}

function createFallingParticle(parent, symbols) {
    const particle = document.createElement('div');
    particle.className = 'win-particle';
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${5 + Math.random() * 6}s`;
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.fontSize = `${18 + Math.random() * 16}px`;
    particle.style.filter = `blur(${Math.random() * 1}px)`;
    parent.appendChild(particle);
}

function triggerLoss() {
  if (gameLost || gameWon) return;
  gameLost = true;
  playFallSound();
  noLoop();
  const container = document.getElementById('game-container');
  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';
  overlay.innerHTML = `<div class="win-card"><div class="win-title">Aparte de que no me defiendes, me dejas caer.</div><button class="btn" id="replayBtn">Volver a intentar</button></div>`;
  container.style.position = 'relative'; container.appendChild(overlay);
  document.getElementById('replayBtn').addEventListener('click', () => loadLevel(currentLevel));
}

// Funciones de utilidad
function playJump() { if (jumpBarkSound && jumpBarkSound.isLoaded()) { jumpBarkSound.play(); } }
function playFallSound() { if (fallSound && fallSound.isLoaded()) { fallSound.play(); } }
function playWinSound() { if (winSound && winSound.isLoaded()) { winSound.play(); } }
function createPetal() { falling.push({ x: random(0, width), y: random(-200, height), vy: random(0.4, 1.2), vx: random(-0.3, 0.3), angle: random(-1,1), spin: random(-0.02, 0.02), alpha: random(100, 220) }); }
function mousePressed() { userStartAudio(); }
