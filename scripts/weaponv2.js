// Electric weapon variables
const electricBulletWidth = 6;
const electricBulletHeight = 20;
const electricBulletSpeed = 10;
const electricBulletDamage = 2.5; // Damage for electric bullets
const electricBatteryConsumption = 55; // Battery consumption for electric bullets
let electricBullets = []; // Array to hold electric bullets
let lastElectricShotTime = 0; // Time when the last electric bullet was shot
let baseCooldownPeriod = 500; // Base cooldown period for electric bullets milliseconds
let rateOfFireMultiplier = 1; // Multiplier to adjust the rate of fire
const spreadAngleRange = 10; // Maximum spread angle in degrees
const numberOfBullets = 5; // Number of bullets to shoot
const bulletSpacing = 10; // Vertical spacing between bullets
const angleSpread = 30; // Total angle spread in degrees

// Function to determine the accuracy of electric bullets
function getElectricBulletAccuracy() {
  return 40 + Math.random() * 40; // Random accuracy between 40 and 80
}

// Function to determine if the electric bullet hits the target
function electricBulletHitsTarget() {
  return Math.random() <= getElectricBulletAccuracy() / 100;
}

// Function to determine the cooldown period based on rate of fire
function getCooldownPeriod() {
  return baseCooldownPeriod / rateOfFireMultiplier;
}

// Function to determine if the player can shoot
function canShootElectric() {
  const currentTime = Date.now();
  return (
    currentTime - lastElectricShotTime >= getCooldownPeriod() &&
    battery >= electricBatteryConsumption
  );
}

// Function to increase the rate of fire
function increaseRateOfFire() {
  rateOfFireMultiplier += 0.5; // Increase the rate of fire (decrease cooldown)
}

// Function to decrease the rate of fire
function decreaseRateOfFire() {
  if (rateOfFireMultiplier > 1) {
    rateOfFireMultiplier -= 0.5; // Decrease the rate of fire (increase cooldown)
  }
}

// Function to shoot electric bullets
function shootElectricBullet() {
  const numberOfBullets = 5; // Set the number of bullets to 5
  const angleSpread = 30; // Set the angle spread (in degrees) for the bullets

  if (canShootElectric()) {
    const baseAngle = (Math.random() * spreadAngleRange - spreadAngleRange / 2) * (Math.PI / 180);
    const angleIncrement = (angleSpread / (numberOfBullets - 1)) * (Math.PI / 180); // Convert to radians
    const centerX = player.x + player.width / 2; // Center X of the player
    const centerY = player.y + player.height / 2; // Center Y of the player
    const totalBatteryConsumption = numberOfBullets * electricBatteryConsumption;

    if (battery >= totalBatteryConsumption) {
      for (let i = 0; i < numberOfBullets; i++) {
        const bulletAngle = baseAngle - (angleSpread / 2) * (Math.PI / 180) + (i * angleIncrement);
        electricBullets.push({
          x: centerX, // All bullets start from the center of the player
          y: centerY, // All bullets start from the center of the player
          width: electricBulletWidth,
          height: electricBulletHeight,
          speed: electricBulletSpeed,
          damage: electricBulletDamage,
          angle: bulletAngle // Each bullet has a different angle
        });
      }

      lastElectricShotTime = Date.now();
      battery -= totalBatteryConsumption; // Deduct total battery for shooting electric bullets
     // bulletSound.play(); // Play the bullet sound effect
    }
  }
}

// Function to update electric bullets
function updateElectricBullets() {
  for (let i = 0; i < electricBullets.length; i++) {
    const bullet = electricBullets[i];
    bullet.y -= bullet.speed * Math.cos(bullet.angle); // Update y position based on angle
    bullet.x += bullet.speed * Math.sin(bullet.angle); // Update x position based on angle

    // Remove electric bullets when they go off screen
    if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
      electricBullets.splice(i, 1);
      i--;
    }
  }
}

// Function to draw electric bullets
function drawElectricBullets() {
  for (let i = 0; i < electricBullets.length; i++) {
    const { x, y, width, height } = electricBullets[i];

    // Save the current canvas state
    ctx.save();

    // Create a gradient for the electric bullet
    const gradient = ctx.createRadialGradient(x + width / 2, y + height / 2, width / 4, x + width / 2, y + height / 2, width);
    gradient.addColorStop(0, "rgba(0, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0)");

    // Apply the gradient and draw the electric bullet
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Add a glow effect
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 20;

    // Draw the electric bullet with the glow
    ctx.fillStyle = "cyan";
    ctx.fillRect(x, y, width, height);

    // Restore the canvas state
    ctx.restore();

    // Draw electric sparks around the bullet
    drawElectricSparks(x + width / 2, y + height / 2, width / 2);
  }
}

// Function to draw electric sparks around the electric bullets
function drawElectricSparks(x, y, radius) {
  const sparkCount = 10; // Number of sparks
  const maxSparkLength = 20; // Maximum length of each spark
  ctx.save();
  for (let i = 0; i < sparkCount; i++) {
    const angle = Math.random() * Math.PI * 2; // Random angle for each spark
    const startX = x + Math.cos(angle) * radius;
    const startY = y + Math.sin(angle) * radius;
    const sparkLength = Math.random() * maxSparkLength; // Random spark length
    const endX = startX + Math.cos(angle) * sparkLength;
    const endY = startY + Math.sin(angle) * sparkLength;

    // Random brightness and thickness for each spark
    const brightness = Math.random() * 0.6 + 0.4;
    const thickness = Math.random() * 2 + 1;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(0, 255, 255, ${brightness})`;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }
  ctx.restore();
}

// Function to detect electric bullet and enemy collisions
function detectElectricBulletEnemyCollisions() {
 // const enemyCollisionSound = new Audio("collision.mp3");
  //enemyCollisionSound.volume = 0.2;

  for (let i = 0; i < electricBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        electricBullets[i].x < enemies[j].x + enemies[j].width &&
        electricBullets[i].x + electricBullets[i].width > enemies[j].x &&
        electricBullets[i].y < enemies[j].y + enemies[j].height &&
        electricBullets[i].y + electricBullets[i].height > enemies[j].y
      ) {
        const distance = Math.sqrt(
          (enemies[j].x + enemies[j].width / 2 - (electricBullets[i].x + electricBullets[i].width / 2)) ** 2 +
          (enemies[j].y + enemies[j].height / 2 - (electricBullets[i].y + electricBullets[i].height / 2)) ** 2
        );

        // Base damage for electric bullets
        const baseDamage = electricBullets[i].damage;

        // Determine damage amount based on distance
        let damage;
        if (distance < 100) {
          damage = (baseDamage * (1 - distance / 100)) - 0.3; // Linear decrease from 100% to 0% based on distance, slight decrease for short range
        } else {
          damage = 0; // No damage beyond 100 pixels
        }

        // Apply balanced damage increase by 0.5%
        const damageIncreaseFactor = 0.005; // 0.5% increase
        const damageMultiplier = 1 + (i * damageIncreaseFactor); // Increase damage based on bullet index
        damage *= damageMultiplier; // Apply the damage multiplier

        // Ensure damage does not go below zero
        damage = Math.max(0, damage);

        // Apply the damage to the enemy's health
        enemies[j].health -= damage;

        // Create a damage indicator
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: damage.toFixed(2),
          lifetime: 30,
          color: getRandomColor()
        });

        // Check if the enemy is defeated
        if (enemies[j].health <= 0) {
          createRedParticles(
            enemies[j].x + enemies[j].width / 2,
            enemies[j].y + enemies[j].height / 2
          );
          enemies.splice(j, 1);
          score += 10;
          coins += 1;
          j--;
        }

        // Play collision sound
     //   enemyCollisionSound.play();
        electricBullets.splice(i, 1); // Remove the electric bullet
        i--; // Adjust index after removal
        break; // Exit the inner loop
      }
    }
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "z") {
    // Press "Z" to shoot ice weapon
    shootIceBullet();
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "m") {
    // Press "M" to shoot a missile
    shootMissile();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "b") {
    // Press "B" to deploy a bomb
    deployBomb();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === " ") {
    // Check if the spacebar is pressed
    shootBullet(e);
  }
});

// Add event listener for electric weapon shooting
document.addEventListener("keydown", e => {
  if (e.key === "e") { // Press "E" to shoot electric weapon
    shootElectricBullet();
  }
});
