// Floating background sparkles
const sparkleLayer = document.getElementById("sparkleLayer");

for (let i = 0; i < 34; i++) {
  const sparkle = document.createElement("i");
  const size = 2 + Math.random() * 3;
  sparkle.style.left = `${Math.random() * 100}%`;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;
  sparkle.style.animationDuration = `${7 + Math.random() * 11}s`;
  sparkle.style.animationDelay = `${-Math.random() * 16}s`;
  sparkle.style.opacity = 0.35 + Math.random() * 0.65;
  sparkleLayer.appendChild(sparkle);
}

// Firework rocket and burst animation
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("celebrateButton");
const message = document.getElementById("celebrationMessage");

let width = 0;
let height = 0;
let rockets = [];
let particles = [];
let animationFrame = null;
let celebrationTimer = null;
let launchInterval = null;
let celebrationActive = false;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const random = (min, max) => Math.random() * (max - min) + min;
const colors = ["#ffd166", "#ff5c8a", "#71f6d2", "#9d8cff", "#fff2a6", "#ff9f43", "#ffffff"];

function launchRocket() {
  rockets.push({
    x: random(width * 0.12, width * 0.88),
    y: height + 10,
    targetY: random(height * 0.16, height * 0.52),
    speed: random(6, 9),
    color: colors[Math.floor(Math.random() * colors.length)],
    trail: []
  });
}

function explode(x, y, color) {
  const count = Math.floor(random(55, 95));
  const style = Math.random();

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + random(-0.08, 0.08);
    const speed = style < 0.35 ? random(1.2, 3.2) : random(1.5, 5.2);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.045,
      friction: 0.985,
      alpha: 1,
      decay: random(0.009, 0.019),
      radius: random(1.2, 2.8),
      color: Math.random() > 0.25 ? color : colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  rockets.forEach((rocket, index) => {
    rocket.trail.push({ x: rocket.x, y: rocket.y });
    if (rocket.trail.length > 7) rocket.trail.shift();

    rocket.y -= rocket.speed;
    ctx.beginPath();
    ctx.moveTo(rocket.x, rocket.y + 15);
    ctx.lineTo(rocket.x, rocket.y);
    ctx.strokeStyle = rocket.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = rocket.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (rocket.y <= rocket.targetY) {
      explode(rocket.x, rocket.y, rocket.color);
      rockets.splice(index, 1);
    }
  });

  particles.forEach((particle, index) => {
    particle.vx *= particle.friction;
    particle.vy = particle.vy * particle.friction + particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.alpha -= particle.decay;

    if (particle.alpha <= 0) {
      particles.splice(index, 1);
      return;
    }

    ctx.globalAlpha = Math.max(0, particle.alpha);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = particle.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;

  if (celebrationActive || rockets.length || particles.length) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    animationFrame = null;
    ctx.clearRect(0, 0, width, height);
  }
}

function startCelebration() {
  if (celebrationActive) return;

  celebrationActive = true;
  button.disabled = true;
  message.classList.add("show");

  // A quick opening volley, followed by a few staggered rocket launches.
  for (let i = 0; i < 5; i++) {
    setTimeout(launchRocket, i * 180);
  }

  let launches = 0;
  launchInterval = setInterval(() => {
    launchRocket();
    launches++;
    if (launches >= 13) {
      clearInterval(launchInterval);
      launchInterval = null;
    }
  }, 330);

  if (!animationFrame) animate();

  celebrationTimer = setTimeout(() => {
    message.classList.remove("show");
    celebrationActive = false;
    button.disabled = false;
    if (!animationFrame && (rockets.length || particles.length)) animate();
  }, 6500);
}

button.addEventListener("click", startCelebration);
