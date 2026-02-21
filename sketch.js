/*
Endless Starry Flight with Minimalist Birds (Framed)

Goal:
- Infinite starry sky background with parallax depth.
- Airplane automatically flying forward.
- Hidden minimalist birds spawn and illuminate as the plane passes near them.
*/

let plane = { x: 100, y: 240, speed: 3.5 };
let cam = { x: 0, y: 0 };
const viewW = 800,
  viewH = 480;

let backStars = [];
let midStars = [];
let frontStars = [];

// Array to hold our hidden birds and a tracker for when to spawn the next one
let birds = [];
let nextBirdX = 800;

function setup() {
  createCanvas(viewW, viewH);

  for (let i = 0; i < 150; i++) backStars.push(createStar(1, 2));
  for (let i = 0; i < 100; i++) midStars.push(createStar(2, 3));
  for (let i = 0; i < 40; i++) frontStars.push(createStar(3, 5));
}

function createStar(minSize, maxSize) {
  return {
    x: random(0, viewW),
    y: random(0, viewH),
    size: random(minSize, maxSize),
    twinkleOffset: random(TWO_PI),
  };
}

function draw() {
  background(0); // Pure black canvas

  // --- 1. Update Airplane & Camera ---
  plane.x += plane.speed;
  plane.y = viewH / 2 + sin(frameCount * 0.04) * 25;
  cam.x = plane.x - 200;

  // --- 2. Draw Star Layers ---
  drawStars(backStars, 0.1, 100);
  drawStars(midStars, 0.4, 180);
  drawStars(frontStars, 0.8, 255);

  // --- 3. Procedural Bird Spawning & Discovery ---
  if (cam.x + viewW + 200 > nextBirdX) {
    birds.push({
      x: nextBirdX,
      y: random(80, viewH - 80),
      speed: random(1, 2),
      flapSpeed: random(0.3, 0.6),
      flapOffset: random(TWO_PI),
      activation: 0,
      discovered: false,
    });
    nextBirdX += random(300, 800);
  }

  // Iterate backwards to safely update and remove off-screen birds
  for (let i = birds.length - 1; i >= 0; i--) {
    let b = birds[i];

    // Birds fly forward autonomously
    b.x += b.speed;

    // Garbage collection: Remove birds that are far behind the camera
    if (b.x < cam.x - 200) {
      birds.splice(i, 1);
      continue;
    }

    // Discovery Logic
    let d = dist(plane.x, plane.y, b.x, b.y);

    if (d < 220) {
      b.activation = lerp(b.activation, 1, 0.06);
      b.discovered = true;
    } else {
      let targetAlpha = b.discovered ? 0.2 : 0;
      b.activation = lerp(b.activation, targetAlpha, 0.02);
    }

    // Only draw if the bird is currently visible
    if (b.activation > 0.01) {
      push();
      translate(b.x - cam.x, b.y);

      let alpha = b.activation * 255;

      // Draw the Minimalist Bird Silhouette
      noStroke();
      fill(200, 240, 255, alpha);

      // Body
      ellipse(0, 0, 14, 8);
      // Head
      circle(6, -2, 8);
      // Beak
      triangle(8, -3, 13, -1, 8, 1);

      // Animated Flapping Wing
      let wingY = sin(frameCount * b.flapSpeed + b.flapOffset) * 10;
      triangle(2, 0, -4, wingY, 6, wingY);

      pop();
    }
  }

  // --- 4. Draw the Airplane ---
  push();
  translate(plane.x - cam.x, plane.y);
  noStroke();

  fill(160, 170, 190);
  triangle(-10, 0, 15, 0, -15, -35); // Back wing
  fill(220, 230, 240);
  ellipse(0, 0, 90, 22); // Body
  fill(190, 200, 215);
  triangle(-30, 0, -45, -25, -20, -5); // Tail
  fill(200, 210, 225);
  triangle(-15, 5, 25, 5, -25, 45); // Front wing
  fill(150, 220, 255, 200);
  arc(25, -4, 25, 16, PI, TWO_PI); // Cockpit

  pop();
}

function drawStars(starArray, parallaxFactor, maxAlpha) {
  noStroke();
  for (let s of starArray) {
    let screenX = (s.x - cam.x * parallaxFactor) % viewW;
    if (screenX < 0) screenX += viewW;
    let screenY = s.y;

    let alpha = map(
      sin(frameCount * 0.05 + s.twinkleOffset),
      -1,
      1,
      maxAlpha * 0.2,
      maxAlpha,
    );
    fill(255, 255, 255, alpha);
    circle(screenX, screenY, s.size);
  }
}
