//let asteroids = [];
//const asteroidWidth = 50;
//const asteroidHeight = 50;
// Function to generate new asteroids randomly
//function generateAsteroids() {
// Check if a new asteroid should be created (1% chance)
//if (Math.random() < 0.01) {
//asteroids.push({
//x: Math.random() * (canvas.width - asteroidWidth), // Random x position within canvas width
//y: -asteroidHeight, // Start position above the canvas
//width: asteroidWidth,
//height: asteroidHeight,
//speed: 1 + Math.random() * 2, // Random speed between 1 and 3
//health: 12,
///color: "brown" // Color of the asteroid
//});
//}
//}
//
// Function to update asteroid positions
//function updateAsteroids() {
//for (let i = asteroids.length - 1; i >= 0; i--) {
//asteroids[i].y += asteroids[i].speed; // Move asteroid down the canvas
// Remove asteroid if it moves out of the canvas
//if (asteroids[i].y > canvas.height) {
//asteroids.splice(i, 1);
//}
// }
//}
// Function to draw asteroids on the canvas
//function drawAsteroids() {
//ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas each frame
//for (let i = 0; i < asteroids.length; i++) {
//ctx.fillStyle = asteroids[i].color || "brown"; // Set the color
//ctx.beginPath();
// Draw asteroid as a circle
//ctx.arc(
//asteroids[i].x + asteroids[i].width / 2,
//asteroids[i].y + asteroids[i].height / 2,
//asteroids[i].width / 2,
// 0,
//Math.PI * 2
//);
//ctx.fill();
//}
//}//
"use strict";