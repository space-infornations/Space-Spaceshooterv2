// Shotgun weapon variables
const shotgunBulletWidth = 8;
const shotgunBulletHeight = 15;
const shotgunBulletSpeed = 8;
const shotgunBulletDamage = 5; // Damage for shotgun bullets
const shotgunBatteryConsumption = 40; // Battery consumption for shotgun bullets
let shotgunBullets = []; // Array to hold shotgun bullets
let lastShotgunShotTime = 0; // Time when the last shotgun bullet was shot
let shotgunBaseCooldownPeriod = 800; // Base cooldown period for shotgun bullets in milliseconds
let shotgunRateOfFireMultiplier = 1; // Multiplier to adjust the rate of fire for shotgun
const shotgunSpreadAngleRange = 20; // Maximum spread angle in degrees for shotgun
const shotgunNumberOfBullets = 8; // Number of bullets to shoot with shotgun
const shotgunAngleSpread = 40; // Total angle spread in degrees for shotgun
const shotgunMaxRange = 300; // Maximum range for shotgun bullets

// Function to determine if the shotgun bullet hits the target
function shotgunBulletHitsTarget() {
  return Math.random() <= getElectricBulletAccuracy() / 100; // Using the same accuracy function for simplicity
}

// Function to determine the cooldown period based on rate of fire for shotgun
function getShotgunCooldownPeriod() {
  return shotgunBaseCooldownPeriod / shotgunRateOfFireMultiplier;
}

// Function to determine if the player can shoot the shotgun
function canShootShotgun() {
  const currentTime = Date.now();
  return (
    currentTime - lastShotgunShotTime >= getShotgunCooldownPeriod() &&
    battery >= shotgunBatteryConsumption
  );
}

// Function to shoot shotgun bullets
function shootShotgun() {
  if (canShootShotgun()) {
    const baseAngle = (Math.random() * shotgunSpreadAngleRange - shotgunSpreadAngleRange / 2) * (Math.PI / 180);
    const angleIncrement = (shotgunAngleSpread / (shotgunNumberOfBullets - 1)) * (Math.PI / 180); // Convert to radians
    const centerX = player.x + player.width / 2; // Center X of the player
    const centerY = player.y + player.height / 2; // Center Y of the player

    if (battery >= shotgunBatteryConsumption) {
      for (let i = 0; i < shotgunNumberOfBullets; i++) {
        const bulletAngle = baseAngle - (shotgunAngleSpread / 2) * (Math.PI / 180) + (i * angleIncrement);
        shotgunBullets.push({
          x: centerX, // All bullets start from the center of the player
          y: centerY, // All bullets start from the center of the player
          width: shotgunBulletWidth,
          height: shotgunBulletHeight,
          speed: shotgunBulletSpeed,
          damage: shotgunBulletDamage,
          angle: bulletAngle, // Each bullet has a different angle
          distanceTraveled: 0 // Track distance traveled
        });
      }

      lastShotgunShotTime = Date.now();
      battery -= shotgunBatteryConsumption; // Deduct battery for shooting shotgun bullets
      // bulletSound.play(); // Play the bullet sound effect
    }
  }
}

// Function to update shotgun bullets
function updateShotgunBullets() {
  for (let i = 0; i < shotgunBullets.length; i++) {
    const bullet = shotgunBullets[i];
    bullet.y -= bullet.speed * Math.cos(bullet.angle); // Update y position based on angle
    bullet.x += bullet.speed * Math.sin(bullet.angle); // Update x position based on angle
    bullet.distanceTraveled += bullet.speed; // Increment distance traveled

    // Remove shotgun bullets when they go off screen or exceed max range
    if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width || bullet.distanceTraveled > shotgunMaxRange) {
      shotgunBullets.splice(i, 1);
      i--;
    }
  }
}

// Function to draw shotgun bullets
function drawShotgunBullets() {
  for (let i = 0; i < shotgunBullets.length; i++) {
    const { x, y, width, height } = shotgunBullets[i];

    // Save the current canvas state
    ctx.save();

    // Create a gradient for the shotgun bullet
    const gradient = ctx.createRadialGradient(x + width / 2, y + height / 2, width / 4, x + width / 2, y + height / 2, width);
    gradient.addColorStop(0, "rgba(255, 165, 0, 1)"); // Orange color for shotgun bullets
    gradient.addColorStop(0.5, "rgba(255, 165, 0, 0.5)");
    gradient.addColorStop(1, "rgba(255, 165, 0, 0)");

    // Apply the gradient and draw the shotgun bullet
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Add a glow effect
    ctx.shadowColor = "orange";
    ctx.shadowBlur = 20;

    // Draw the shotgun bullet with the glow
    ctx.fillStyle = "orange";
    ctx.fillRect(x, y, width, height);

    // Restore the canvas state
    ctx.restore();
  }
}

// Example of how to shoot the shotgun
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyV') { // Change to 'KeyV' for the V key
    shootShotgun();
  }
});