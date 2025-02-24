"use strict";

var asteroids = [];

function drawAsteroids() {
  for (var i = 0; i < asteroids.length; i++) {
    if (asteroids[i].isDiamond) {
      ctx.fillStyle = "#C0C0C0"; // Silver color for diamond-like asteroids
    } else {
      ctx.fillStyle = "#7D7D7D"; // Grey color for regular asteroids
    }

    ctx.beginPath();
    ctx.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function updateAsteroids() {
  for (var i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].y += asteroids[i].speed; // Remove asteroids that go off the screen

    if (asteroids[i].y > canvas.height) {
      asteroids.splice(i, 1);
      continue;
    } // Remove asteroids with 0 health


    if (asteroids[i].health <= 0) {
      asteroids.splice(i, 1);
    }
  }
}

function generateAsteroids() {
  if (Math.random() < 0.01) {
    // Adjust spawn rate as needed
    var isDiamond = Math.random() < 0.1; // 10% chance to generate a diamond asteroid

    asteroids.push({
      x: Math.random() * canvas.width,
      y: -30,
      // Start above the canvas
      radius: 20 + Math.random() * 20,
      // Random radius between 20 and 40
      speed: 1 + Math.random() * 3,
      // Random speed between 1 and 4
      health: 12,
      // Health points
      isDiamond: isDiamond // Flag to identify diamond-like asteroids

    });
  }
}