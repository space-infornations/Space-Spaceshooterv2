"use strict";

var enemies = [];
var enemyWidth = 50;
var enemyHeight = 30;

function drawEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    /***************************************************************
     * // CHECK IF THE ENEMY IS FROZEN (AFFECTED BY AN ICE BULLET) *
     ***************************************************************/
    if (enemies[i].isFrozen) {
      ctx.fillStyle = "#D7FFFA"; // Apply blue color for frozen enemies
    } else {
      // Use the enemy's color if defined, otherwise use red
      ctx.fillStyle = enemies[i].color || "red"; // Default to red if no color is set
    } // Draw the main body of the enemy spaceship (a diamond shape)


    ctx.beginPath();
    ctx.moveTo(enemies[i].x + enemies[i].width / 2, enemies[i].y); // Top point

    ctx.lineTo(enemies[i].x, enemies[i].y + enemies[i].height / 2); // Left point

    ctx.lineTo(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height); // Bottom point

    ctx.lineTo(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height / 2); // Right point

    ctx.closePath();
    ctx.fill(); // Draw the cockpit (a small circle in the center of the enemy spaceship)

    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2, enemies[i].width / 6, 0, Math.PI * 2);
    ctx.fill(); // Add visual indicator for orange explosive enemy

    if (enemies[i].type === "explosive" && enemies[i].color === "orange") {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2, enemies[i].width / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    } // Reset the color for the next enemy


    ctx.fillStyle = "red";
  }
}

function updateEnemies() {
  for (var i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed; // Remove enemies that go off the screen

    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      continue;
    }
  }
}

function generateEnemies() {
  if (Math.random() < 0.02) {
    // Adjust the overall spawn rate as needed
    var enemyType = Math.random();

    if (enemyType < 0.35) {
      // 35% chance to generate regular enemy
      var hasShield = Math.random() < 0.25; // 25% chance to have a shield

      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: hasShield ? 2 + Math.random() * 1 : 2 + Math.random() * 2,
        // Slower if shielded
        health: hasShield ? 1 : 2,
        // Health is 1 if shielded, otherwise 2
        shield: hasShield ? 1 : 0 // Shield strength of 1 if shielded, otherwise 0

      });
    } else if (enemyType < 0.6) {
      // 25% chance to generate slow big grey enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth * 1.5,
        // Make it bigger
        height: enemyHeight * 1.5,
        speed: 1,
        // Slow speed
        health: 4,
        // 4 health points
        shield: 0,
        // No shield
        color: "grey" // Color grey

      });
    } else if (enemyType < 0.75) {
      // 15% chance to generate silver enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 2,
        // Normal speed
        health: 8,
        // 8 health points
        shield: 0,
        // No shield
        color: "silver" // Silver color

      });
    } else if (enemyType < 0.9) {
      // 15% chance to generate the normal white enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 3,
        // Normal speed
        health: 6,
        // 6 health points
        shield: 0,
        // No shield
        color: "white" // White color

      });
    } else if (enemyType < 1.0) {
      // 10% chance to generate the new purple enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 2,
        // Fast speed
        health: 10,
        // 10 health points
        shield: 1,
        // Shield strength of 1
        color: "purple" // Purple color

      });
    }
  }
}