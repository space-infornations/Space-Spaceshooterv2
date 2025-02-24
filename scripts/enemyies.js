let enemies = [];
const enemyWidth = 50;
const enemyHeight = 30;

// Assuming enemies are initialized with a 'damaged' property
function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].isFrozen) {
      ctx.fillStyle = "#D7FFFA"; // Apply blue color for frozen enemies
    } else if (enemies[i].damaged) {
      ctx.fillStyle = "yellow"; // Change color to yellow when damaged
    } else if (enemies[i].gradient) {
      // Use the gradient if defined
      let gradient = ctx.createLinearGradient(
        enemies[i].x,
        enemies[i].y,
        enemies[i].x,
        enemies[i].y + enemies[i].height
      );
      // Manually set the gradient stops based on the enemy's gradient
      if (enemies[i].gradient === "linear-gradient(to bottom, blue, green)") {
        gradient.addColorStop(0, "blue");
        gradient.addColorStop(1, "green");
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, red, yellow)"
      ) {
        gradient.addColorStop(0, "red");
        gradient.addColorStop(1, "yellow");
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, purple, orange)"
      ) {
        gradient.addColorStop(0, "purple");
        gradient.addColorStop(1, "orange");
      }

      ctx.fillStyle = gradient;
    } else {
      // Use the enemy's color if defined, otherwise use red
      ctx.fillStyle = enemies[i].color || "red"; // Default to red if no color is set
    }

    // Draw the main body of the enemy spaceship (a diamond shape)
    ctx.beginPath();
    ctx.moveTo(enemies[i].x + enemies[i].width / 2, enemies[i].y); // Top point
    ctx.lineTo(enemies[i].x, enemies[i].y + enemies[i].height / 2); // Left point
    ctx.lineTo(
      enemies[i].x + enemies[i].width / 2,
      enemies[i].y + enemies[i].height
    ); // Bottom point
    ctx.lineTo(
      enemies[i].x + enemies[i].width,
      enemies[i].y + enemies[i].height / 2
    ); // Right point
    ctx.closePath();
    ctx.fill();

    // Draw the cockpit (a small circle in the center of the enemy spaceship)
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(
      enemies[i].x + enemies[i].width / 2,
      enemies[i].y + enemies[i].height / 2,
      enemies[i].width / 6,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Reset the color for the next enemy
    ctx.fillStyle = "red";
  }
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;

    // Remove enemies that go off the screen
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      continue;
    }
  }
}

function generateEnemies() {
  if (Math.random() < 0.02) {
    // Adjust the overall spawn rate as needed
    const enemyType = Math.random();

    if (enemyType < 0.35) {
      // 35% chance to generate regular enemy
      const hasShield = Math.random() < 0.25; // 25% chance to have a shield
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: hasShield ? 2 + Math.random() * 1 : 2 + Math.random() * 2, // Slower if shielded
        health: hasShield ? 1 : 2, // Health is 1 if shielded, otherwise 2
        shield: hasShield ? 1 : 0 // Shield strength of 1 if shielded, otherwise 0
      });
    } else if (enemyType < 0.6) {
      // 25% chance to generate slow big grey enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth * 1.5, // Make it bigger
        height: enemyHeight * 1.5,
        speed: 1, // Slow speed
        health: 4, // 4 health points
        shield: 1, // 1 shield
        color: "grey" // Color grey
      });
    } else if (enemyType < 0.75) {
      // 15% chance to generate silver enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 2, // Normal speed
        health: 8, // 8 health points
        shield: 2, // No shield
        color: "silver" // Silver color
      });
    } else if (enemyType < 0.9) {
      // 15% chance to generate the normal white enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 3, // Normal speed
        health: 6, // 6 health points
        shield: 3, // No shield
        color: "white" // White color
      });
    } else if (enemyType < 0.95) {
      // 5% chance to generate the dark blue enemy
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 1, // Slightly faster speed
        health: 10, // 10 health points
        shield: 40, // shield
        color: "darkblue" // Dark blue color
      });
    } else {
      // 10% chance to generate the new gradient enemy with variations
      const variation = Math.random();
      let health;
      let gradient;
      if (variation < 0.33) {
        health = 18; // balanced hp
        gradient = "linear-gradient(to bottom, blue, green)";
      } else if (variation < 0.66) {
        health = 22; // balanced hp
        gradient = "linear-gradient(to bottom, red, yellow)";
      } else {
        health = 26; // balanced hp
        gradient = "linear-gradient(to bottom, purple, orange)";
      }
    
      enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 2, // Fast speed
        health: health, // Health points
        shield: 1, // Shield strength of 1
        gradient: gradient // Gradient color
      });
    }
  }
}

// asteriods 
let asteroids = [];
const asteroidWidth = 40;
const asteroidHeight = 40;

// Function to draw asteroids
function drawAsteroids() {
  for (let i = 0; i < asteroids.length; i++) {
    ctx.fillStyle = "gray"; // Color for asteroids
    ctx.beginPath();
    ctx.arc(
      asteroids[i].x + asteroids[i].width / 2,
      asteroids[i].y + asteroids[i].height / 2,
      asteroids[i].width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// Function to update asteroids
function updateAsteroids() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].y += asteroids[i].speed;

    // Remove asteroids that go off the screen
    if (asteroids[i].y > canvas.height) {
      asteroids.splice(i, 1); // Remove the asteroid
      continue;
    }
  }
}

// Function to generate asteroids
function generateAsteroids() {
  if (Math.random() < 0.01) { // Adjust the spawn rate as needed
    asteroids.push({
      x: Math.random() * (canvas.width - asteroidWidth),
      y: -asteroidHeight,
      width: asteroidWidth,
      height: asteroidHeight,
      speed: 2 + Math.random() * 2, // Random speed between 2 and 4
      health: 12 // Assuming each asteroid has a health property
    });
  }
}
function detectBulletAsteroidCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) { // Loop backwards for bullets
    for (let j = asteroids.length - 1; j >= 0; j--) { // Loop backwards for asteroids
      if (
        bullets[i].x < asteroids[j].x + asteroidWidth &&
        bullets[i].x + bullets[i].width > asteroids[j].x &&
        bullets[i].y < asteroids[j].y + asteroidHeight &&
        bullets[i].y + bullets[i].height > asteroids[j].y
      ) {
        // Calculate the distance between the bullet and the asteroid
        const bulletCenterX = bullets[i].x + bullets[i].width / 2;
        const bulletCenterY = bullets[i].y + bullets[i].height / 2;
        const asteroidCenterX = asteroids[j].x + asteroidWidth / 2;
        const asteroidCenterY = asteroids[j].y + asteroidHeight / 2;

        const distance = Math.sqrt(
          (bulletCenterX - asteroidCenterX) ** 2 +
          (bulletCenterY - asteroidCenterY) ** 2
        );

        let modifiedDamage;

        // Use the bullet's damage value
        const baseDamage = bullets[i].damage;

        // Check if the bullet is a dual bullet
        if (bullets[i].isDual) {
          // Adjust damage based on distance
          if (distance < 50) {
            modifiedDamage = baseDamage * 2; // Double damage for short range
          } else if (distance > 100) {
            modifiedDamage = baseDamage * 0.5; // Decrease damage by 50% for long range
          } else {
            modifiedDamage = baseDamage; // Normal damage for mid-range
          }
        } else {
          // Adjust damage based on distance for normal bullets
          if (distance < 50) {
            modifiedDamage = baseDamage * 1.5; // Increase damage by 50% for short range
          } else if (distance > 100) {
            modifiedDamage = baseDamage * 0.8; // Decrease damage by 20% for long range
          } else {
            modifiedDamage = baseDamage; // Normal damage for mid-range
          }
        }

        // Assuming asteroids have a health property
        asteroids[j].health -= modifiedDamage;

        // Create damage indicators
        damageIndicators.push({
          x: asteroids[j].x + asteroidWidth / 2,
          y: asteroids[j].y + asteroidHeight / 2,
          text: modifiedDamage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
        });

        if (asteroids[j].health <= 0) {
          createRedParticles(
            asteroids[j].x + asteroidWidth / 2,
            asteroids[j].y + asteroidHeight / 2
          );
          asteroids.splice(j, 1); // Remove the asteroid
          score += Math.ceil(5 * 1.5); // Adjust score for destroying an asteroid by 50%
        }

        bullets.splice(i, 1); // Remove the bullet
        break; // Exit the inner loop after a collision
      }
    }
  }
  // Check for asteroid collisions with the player
  detectAsteroidPlayerCollisions();
}