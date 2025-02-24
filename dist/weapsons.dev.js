"use strict";

// ice-gun weapon and other items
var iceSound = new Audio("Ice Crack Freeze Sound Effect.mp3"); // Load the ice weapon sound file

var iceRateOfFire = 3; // Number of ice shots per second

var iceShootInterval = 1000 / iceRateOfFire; // Interval between ice shots in milliseconds

var iceDamage = 1.2; // Updated ice weapon damage

var iceBatteryConsumption = 2; // Battery consumption per ice shot

var isIceShooting = false; // Track if the ice weapon is shooting

var iceLastShotTime = 0; // Last shot time for the ice weapon
// Ice bullets array

var iceBullets = []; // Ice weapon shooting logic

function shootIceBullet() {
  var currentTime = Date.now();

  if (currentTime - iceLastShotTime >= iceShootInterval && // Check rate of fire
  battery >= iceBatteryConsumption // Ensure enough battery is available
  ) {
      if (!isIceShooting) {
        isIceShooting = true; // Determine if the shot is accurate

        var isAccurate = Math.random() <= 0.5; // 50% chance to be accurate

        var shotXDeviation = isAccurate ? 0 : (Math.random() - 0.5) * 20; // Deviation for inaccurate shots
        // Create the ice bullet

        var iceBullet = {
          x: player.x + player.width / 2 - bulletWidth / 2 + shotXDeviation,
          // Apply deviation
          y: player.y,
          width: bulletWidth,
          height: bulletHeight,
          speed: 5,
          // Slower speed for ice bullets
          damage: iceDamage,
          // Updated damage
          slowEffect: iceSlowEffect // Slowdown effect

        };
        iceBullets.push(iceBullet);
        iceLastShotTime = currentTime; // Update last shot time

        battery -= iceBatteryConsumption; // Consume battery for the shot

        iceSound.play(); // Play the ice weapon sound effect
        // Reset isIceShooting after the shot

        setTimeout(function () {
          isIceShooting = false;
        }, iceShootInterval);
      }
    }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "z") {
    // Press "Z" to shoot ice weapon
    shootIceBullet();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "m") {
    // Press "M" to shoot a missile
    shootMissile();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "b") {
    // Press "B" to deploy a bomb
    deployBomb();
  }
}); // Update the position of ice bullets

function updateIceBullets() {
  for (var i = 0; i < iceBullets.length; i++) {
    iceBullets[i].y -= iceBullets[i].speed; // Move the bullet upward
    // Remove bullets when they go off the screen

    if (iceBullets[i].y < 0) {
      iceBullets.splice(i, 1); // Remove the bullet from the array

      i--; // Adjust the index
    }
  }
} // Draw ice bullets on the canvas


function drawIceBullets() {
  for (var i = 0; i < iceBullets.length; i++) {
    // Set the shadow properties for depth
    ctx.shadowColor = "rgba(0, 255, 255, 0.5)"; // Light cyan shadow

    ctx.shadowBlur = 10; // Blur effect

    ctx.shadowOffsetX = 0; // No offset

    ctx.shadowOffsetY = 0; // No offset
    // Create a gradient for the icy look

    var gradient = ctx.createLinearGradient(iceBullets[i].x, iceBullets[i].y, iceBullets[i].x + iceBullets[i].width, iceBullets[i].y + iceBullets[i].height);
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)"); // Light cyan

    gradient.addColorStop(1, "rgba(0, 200, 255, 0.5)"); // Slightly darker cyan
    // Fill the rectangle with the gradient

    ctx.fillStyle = gradient;
    ctx.fillRect(iceBullets[i].x, iceBullets[i].y, iceBullets[i].width, iceBullets[i].height); // Optional: Draw a light blue outline for texture

    ctx.strokeStyle = "rgba(0, 150, 255, 0.7)"; // Light blue outline

    ctx.lineWidth = 2; // Outline width

    ctx.strokeRect(iceBullets[i].x, iceBullets[i].y, iceBullets[i].width, iceBullets[i].height);
  } // Reset shadow properties to avoid affecting other drawings


  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
} // Constants for balancing


var iceSlowEffect = 0.7; // Slowdown factor (30% speed reduction)

var incrementalDamage = 0.6; // Reduced damage per bullet hit

var effectDuration = 2000; // Duration of the effect in milliseconds (2 seconds)

var maxIceStacks = 2; // Maximum number of ice stacks an enemy can have

var damageThreshold = 0.3; // Total damage threshold to apply additional effects
// Apply slowdown effect and incremental damage to enemies hit by ice bullets

function applyIceEffect(enemy, bullet) {
  // Check if the enemy already has the maximum number of ice stacks
  if (enemy.iceStacks >= maxIceStacks) {
    return; // Do not apply further effects if max stacks reached
  } // Apply the slowdown effect only once for each bullet hit


  enemy.speed *= iceSlowEffect; // Reduce enemy speed by the slowdown factor

  enemy.iceStacks = (enemy.iceStacks || 0) + 1; // Increment ice stacks
  // Apply incremental damage for this specific bullet

  if (!bullet.effectApplied) {
    enemy.health -= incrementalDamage; // Add incremental damage per bullet hit

    bullet.effectApplied = true; // Mark that the effect has been applied to this bullet
  } // Check if total damage exceeds threshold for additional effects


  if (enemy.health <= damageThreshold) {
    // Apply additional effects, e.g., a visual cue or a different status effect
    enemy.isCritical = true; // Example: mark enemy as critical
  } // Set enemy color to blue to represent the ice effect


  enemy.isFrozen = true; // Set a flag indicating the enemy is frozen
  // Restore original speed after the effect duration

  setTimeout(function () {
    enemy.speed /= iceSlowEffect; // Restore enemy speed

    enemy.isFrozen = false; // Reset the frozen effect

    enemy.iceStacks--; // Decrement ice stacks
  }, effectDuration); // Slowdown lasts for the specified duration
} // Missile properties


var missileSound = new Audio("Missile Launch Sound Effect.mp3"); // Load missile sound file

var missileMaxCount = 99; // Maximum number of missiles

var missileCooldown = 2000; // Cooldown between missile launches in milliseconds

var missileDamage = 1.5; // High damage for missiles

var missileCount = missileMaxCount; // Current missile count

var missileLastShotTime = 0; // Last shot time for missiles
// Missile array

var missiles = []; // Missile shooting logic

function shootMissile() {
  var currentTime = Date.now();

  if (missileCount > 0 && // Check if missiles are available
  currentTime - missileLastShotTime >= missileCooldown // Check cooldown
  ) {
      // Create the missile
      var missile = {
        x: player.x + player.width / 2 - bulletWidth / 2,
        // Center the missile
        y: player.y,
        width: bulletWidth * 2,
        // Larger size
        height: bulletHeight * 2,
        speed: 3,
        // Slower speed
        damage: missileDamage // High damage

      };
      missiles.push(missile);
      missileCount--; // Decrease the missile count

      missileLastShotTime = currentTime; // Update last shot time

      missileSound.play(); // Play the missile launch sound effect
    }
} // Update the position of missiles


function updateMissiles() {
  for (var i = 0; i < missiles.length; i++) {
    missiles[i].y -= missiles[i].speed; // Move the missile upward
    // Remove missiles when they go off the screen

    if (missiles[i].y < 0) {
      missiles.splice(i, 1); // Remove the missile from the array

      i--; // Adjust the index
    }
  }
} // Draw missiles on the canvas


function drawMissiles() {
  for (var i = 0; i < missiles.length; i++) {
    // Set the shadow properties for depth
    ctx.shadowColor = "rgba(255, 69, 0, 0.5)"; // Red-orange shadow

    ctx.shadowBlur = 20; // Blur effect

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0; // Create a gradient for the fiery look

    var gradient = ctx.createLinearGradient(missiles[i].x, missiles[i].y, missiles[i].x + missiles[i].width, missiles[i].y + missiles[i].height);
    gradient.addColorStop(0, "rgba(255, 140, 0, 0.8)"); // Bright orange

    gradient.addColorStop(1, "rgba(255, 69, 0, 0.5)"); // Red-orange
    // Draw the missile body

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(missiles[i].x + missiles[i].width / 2, missiles[i].y); // Nose

    ctx.lineTo(missiles[i].x + missiles[i].width, missiles[i].y + missiles[i].height); // Right fin

    ctx.lineTo(missiles[i].x, missiles[i].y + missiles[i].height); // Left fin

    ctx.closePath();
    ctx.fill(); // Optional: Add a glowing outline for emphasis

    ctx.strokeStyle = "rgba(255, 215, 0, 0.7)"; // Golden outline

    ctx.lineWidth = 3;
    ctx.stroke(); // Draw fins for added realism

    ctx.fillStyle = "rgba(200, 0, 0, 0.8)"; // Darker red for fins

    ctx.beginPath();
    ctx.moveTo(missiles[i].x + missiles[i].width / 2, missiles[i].y + missiles[i].height); // Base of the missile

    ctx.lineTo(missiles[i].x + missiles[i].width * 0.75, missiles[i].y + missiles[i].height + 10); // Right fin

    ctx.lineTo(missiles[i].x + missiles[i].width * 0.25, missiles[i].y + missiles[i].height + 10); // Left fin

    ctx.closePath();
    ctx.fill(); // Optional: Add a small flame effect at the back of the missile

    ctx.fillStyle = "rgba(255, 69, 0, 0.8)"; // Flame color

    ctx.beginPath();
    ctx.moveTo(missiles[i].x + missiles[i].width / 2, missiles[i].y + missiles[i].height); // Base of the missile

    ctx.lineTo(missiles[i].x + missiles[i].width / 2 - 5, missiles[i].y + missiles[i].height + 10); // Left flame

    ctx.lineTo(missiles[i].x + missiles[i].width / 2 + 5, missiles[i].y + missiles[i].height + 10); // Right flame

    ctx.closePath();
    ctx.fill();
  } // Reset shadow properties


  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
} // Draw the missile count UI text


function drawMissileCount() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Missiles: ".concat(missileCount), 20, 30);
} // Recharge missiles (optional feature)
//setInterval(() => {
//if (missileCount < missileMaxCount) {
// missileCount++; // Recharge one missile
//}
//}, 10000); // Recharge interval: 10 seconds


function gameLoop() {
  if (checkGameOver()) {
    drawGameOver();
    return; // Stop the game loop
  }

  if (paused) {
    drawPauseScreen(); // Display pause screen if paused

    return; // Stop updating and rendering while paused
  }

  clear();
  updatePlayer();
  generateEnemies();
  updateEnemies();
  detectCollisions();
  rechargeBattery(); // Recharge battery over time

  drawPlayer();
  drawCoins();
  drawEnemies();
  drawScore();
  drawBatteryBar(); // Draw the battery bar

  drawPlayerHealthBar(); // Draw the player's health bar

  requestAnimationFrame(gameLoop);
  drawDamageIndicators();
  updateScore();
  drawScore(); //standard weapon

  updateBullets(); //bomb effects

  drawBombEffect(); // Draw bomb explosion effect if applicable
  // ice bullets
  // Draw ice bullets

  drawIceBullets(); // Detect collisions between ice bullets and enemies

  detectIceBulletCollisions(enemies); // Update ice bullets

  updateIceBullets();
  renderIndicators(ctx);
  drawBullets(); // New  weapon Misssile
  // Update missiles

  updateMissiles(); // Draw missiles

  drawMissiles(); // Draw the missile count UI text

  drawMissileCount();
  checkMissileCollisions(); //Enemy asteriod
}

gameLoop(); // Start the game loop