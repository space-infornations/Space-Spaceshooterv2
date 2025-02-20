const maxZones = 5; // Maximum number of radiation zones
let radiationZones = []; // Array to hold radiation zones

// Function to spawn a new radiation zone
function spawnRadiationZone() {
  if (radiationZones.length < maxZones) { // Check if we can add more zones
    let newZone = {
      x: Math.random() * (canvas.width - 100) + 50, // Random X position
      y: Math.random() * (canvas.height - 100) + 50, // Random Y position
      radius: 100, // Radius of the radiation zone
      active: true, // Whether the zone is active
      damage: 1, // Damage per second while in the zone
      duration: 5000 // Duration the zone stays active
    };

    // Check for overlap with existing zones
    let overlap = radiationZones.some(zone => {
      const distance = Math.sqrt(
        Math.pow(newZone.x - zone.x, 2) +
        Math.pow(newZone.y - zone.y, 2)
      );
      return distance < (newZone.radius + zone.radius);
    });

    // Only add the new zone if there's no overlap
    if (!overlap) {
      radiationZones.push(newZone);

      // Set a timeout to deactivate the zone after its duration
      setTimeout(() => {
        newZone.active = false; // Deactivate the zone after the duration
      }, newZone.duration);
    }
  }
}

// Call spawnRadiationZone every 2 seconds
setInterval(spawnRadiationZone, 2000); // Spawn a new radiation zone every 2 seconds

// Function to draw all radiation zones
function drawRadiationZones() {
  radiationZones.forEach(zone => {
    if (zone.active) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Semi-transparent red for the radiation zone
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Function to check if the player is in any radiation zone
function checkRadiationZones() {
  radiationZones.forEach(zone => {
    if (zone.active) {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - zone.x, 2) +
        Math.pow(playerCenterY - zone.y, 2)
      );

      if (distance < zone.radius) {
        // Player is in the radiation zone
        player.health -= zone.damage; // Apply damage
        if (player.health < 0) {
          player.health = 0; // Prevent negative health
        }
      }
    }
  });
}

// Integrate into the game loop
function gameLoop() {
  clear(); // Clear the canvas
  updatePlayer(); // Update player position
  updateBullets(); // Update bullets
  rechargeBattery(); // Recharge battery

  drawPlayer(); // Draw the player
  drawBullets(); // Draw bullets
  drawCoins(); // Draw coins
  drawScore(); // Draw score
  drawPlayerHealthBar(); // Draw health bar
  drawBatteryBar(); // Draw battery bar

  if (checkGameOver()) {
    drawGameOver(); // Draw game over screen
  } else {
    requestAnimationFrame(gameLoop); // Continue the game loop
  }
}
checkRadiationZones(); // Check for radiation zone effects
drawRadiationZones(); // Draw all radiation zones
// Start the game loop
gameLoop();