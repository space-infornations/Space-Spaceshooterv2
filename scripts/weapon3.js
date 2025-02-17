// Bouncing bomb weapon variables
const bouncingBombWidth = 12;
const bouncingBombHeight = 12;
const bouncingBombSpeed = 4;
const bouncingBombDamage = 30; // Damage for bouncing bombs
const bouncingBombBatteryConsumption = 50; // Battery consumption for bouncing bombs
let bouncingBombs = []; // Array to hold bouncing bombs
let lastBouncingBombShotTime = 0; // Time when the last bouncing bomb was shot
const bouncingBombCooldownPeriod = 1000; // Cooldown period for bouncing bombs in milliseconds
const maxBounces = 3; // Maximum number of bounces before explosion

// Function to shoot bouncing bombs
function shootBouncingBomb() {
  if (canShootBouncingBomb()) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    bouncingBombs.push({
      x: centerX - bouncingBombWidth / 2,
      y: centerY - bouncingBombHeight / 2,
      width: bouncingBombWidth,
      height: bouncingBombHeight,
      speed: bouncingBombSpeed,
      damage: bouncingBombDamage,
      bounces: 0 // Track the number of bounces
    });

    lastBouncingBombShotTime = Date.now();
    battery -= bouncingBombBatteryConsumption; // Deduct battery for shooting
    bouncingBombSound.play(); // Play bouncing bomb sound effect
  }
}

// Function to check if the player can shoot bouncing bombs
function canShootBouncingBomb() {
  const currentTime = Date.now();
  return (
    currentTime - lastBouncingBombShotTime >= bouncingBombCooldownPeriod &&
    battery >= bouncingBombBatteryConsumption
  );
}

// Function to update bouncing bombs
function updateBouncingBombs() {
  for (let i = 0; i < bouncingBombs.length; i++) {
    const bomb = bouncingBombs[i];
    bomb.y -= bomb.speed; // Move the bomb upwards

    // Check for wall collisions (assuming walls are at canvas edges)
    if (bomb.x <= 0 || bomb.x + bomb.width >= canvas.width) {
      bomb.bounces++;
      bomb.speed = -bomb.speed; // Reverse direction on x-axis
    }
    if (bomb.y <= 0) {
      bomb.bounces++;
      bomb.speed = -bomb.speed; // Reverse direction on y-axis
    }

    // Check for explosion
    if (bomb.bounces >= maxBounces) {
      explodeBouncingBomb(bomb);
      bouncingBombs.splice(i, 1); // Remove bomb after explosion
      i--; // Adjust index after removal
    }
  }
}

// Function to handle bouncing bomb explosion
function explodeBouncingBomb(bomb) {
  for (let j = 0; j < enemies.length; j++) {
    const enemy = enemies[j];
    const distance = Math.sqrt(
      (enemy.x + enemy.width / 2 - (bomb.x + bomb.width / 2)) ** 2 +
      (enemy.y + enemy.height / 2 - (bomb.y + bomb.height / 2)) ** 2
    );

    if (distance <= 50) { // Explosion radius
      enemy.health -= bomb.damage * (1 - distance / 50); // Damage based on distance
    }
  }
}