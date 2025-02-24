const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const playerWidth = 50;
const playerHeight = 30;
const bulletWidth = 5;
const bulletHeight = 15;

let score = 0;

const playerSkins = [
  { color: "white" }, // Default skin
  { color: "blue" },  // Skin 1
  { color: "green" }, // Skin 2
  { color: "red" },   // Skin 3
  { color: "yellow" }  // Skin 4
];

let currentSkinIndex = 0; // Index of the currently selected skin

let player = {
  x: canvas.width / 2 - playerWidth / 2,
  y: canvas.height - playerHeight - 10,
  width: playerWidth,
  height: playerHeight,
  speed: 5,
  dx: 0,
  health: 125,
  skin: playerSkins[currentSkinIndex] // Add skin property
};

let lastShotTime = 0; // Time when the last bullet was shot
const cooldownPeriod = 300; // Cooldown period for shooting in milliseconds (300ms)
const batteryConsumption = 10.0; // Battery consumption per bullet
let bullets = [];
//const bulletSound = new Audio("bulletsoundcanon1.mp3"); // Load the bullet sound file
let isShooting = false; // To track whether the spacebar is being held down
const rateOfFire = 10; // Number of shots per second
const shootInterval = 1000 / rateOfFire; // Interval between shots in milliseconds
const bulletDamage = 0.99; // Bullet damage
let overheatLevel = 0; // Track overheating
const maxOverheat = 100; // Maximum overheat level
const overheatIncrease = 5; // Overheat increase per shot
const overheatCooldownRate = 2; // Overheat cooldown rate per second
let shootingMode = 'normal'; // Default shooting mode

// Maximum bullets for each mode
const maxNormalBullets = 3; // Max bullets in normal mode
const maxDualBullets = 7; // Max bullets in dual mode

function canShoot() {
  const currentTime = Date.now();
  return (
    currentTime - lastShotTime >= cooldownPeriod &&
    battery >= batteryConsumption &&
    currentTime - lastBatteryCooldownTime >= batteryCooldownPeriod &&
    overheatLevel < maxOverheat
  );
}

function shootBullet(e) {
  if (canShoot()) {
    if (!isShooting) {
      isShooting = true;
      shootIntervalID = setInterval(() => {
        const currentShotTime = Date.now();
        if (canShoot()) {
          let bulletsToFire = shootingMode === 'normal' ? maxNormalBullets : maxDualBullets;
          let bulletsFired = 0;

          while (bulletsFired < bulletsToFire) {
            const isAccurate = Math.random() <= (shootingMode === 'dual' ? 0.5 : 0.3); // Adjust accuracy based on mode
            const shotXDeviation = isAccurate ? 0 : (Math.random() - 0.5) * 20; // Deviation

            // Normal mode: shoot one bullet
            if (shootingMode === 'normal') {
              bullets.push({
                x: player.x + player.width / 2 - bulletWidth / 2 + shotXDeviation,
                y: player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: 7,
                damage: bulletDamage,
                isDual: false // Normal bullet
              });
            }
            // Dual mode: shoot two bullets
            else if (shootingMode === 'dual') {
              bullets.push({
                x: player.x + player.width / 2 - bulletWidth / 2 + shotXDeviation,
                y: player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: 7,
                damage: bulletDamage,
                isDual: true // Dual bullet
              });
              bullets.push({
                x: player.x + player.width / 2 - bulletWidth / 2 + shotXDeviation + 5, // Slight offset for the second bullet
                y: player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: 7,
                damage: bulletDamage,
                isDual: true // Dual bullet
              });
            }

            bulletsFired++;
          }

          // Adjust battery consumption based on mode
          if (shootingMode === 'normal') {
            battery -= batteryConsumption * bulletsFired; // Normal mode consumption
          } else if (shootingMode === 'dual') {
            battery -= (batteryConsumption * 1.17) * bulletsFired; // 77% increase in consumption per bullet in dual mode
          }

          lastShotTime = currentShotTime;
          lastBatteryCooldownTime = currentShotTime;
          overheatLevel += overheatIncrease;

          // bulletSound.play(); // Play the bullet sound effect per shot
        }
      }, shootingMode === 'dual' ? shootInterval * 0.95 : shootInterval); // Adjust shoot interval for dual mode
    }
  }
}

function toggleShootingMode() {
  shootingMode = shootingMode === 'normal' ? 'dual' : 'normal';
  console.log(`Shooting mode switched to: ${shootingMode}`);
}

// Event listener for shooting with the spacebar
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    shootBullet(e);
  } else if (e.code === 'KeyT') { // Check for toggling shooting mode
    toggleShootingMode();
  }
});
function toggleShootingMode() {
  shootingMode = shootingMode === 'normal' ? 'dual' : 'normal';
  console.log(`Shooting mode switched to: ${shootingMode}`);
}

// Event listener for shooting with the spacebar
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    shootBullet(e);
  }
});

function drawBullets() {
  // Create a fading effect on the canvas
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Adjust the alpha for stronger or weaker trails
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Apply the fade

  for (let i = 0; i < bullets.length; i++) {
    const { x, y, width, height } = bullets[i];
    const radius = 4; // Adjust as needed

    // Draw the bullet tail
    drawBulletTail(x, y, width, height);

    // Create gradient for the bullets
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(0.5, "gold");
    gradient.addColorStop(1, "orange");

    // Add shadow for a more pronounced glow effect
    ctx.shadowColor = "orange";
    ctx.shadowBlur = 15;

    // Draw the bullet with gradient and shadow
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();

    // Draw sparkles for additional detail
    drawSparkles(x, y, width, height);

    // Reset shadow settings
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
}

function drawBulletTail(x, y, width, height) {
  const tailLength = 20; // Length of the bullet tail
  for (let i = 1; i <= tailLength; i++) {
    const tailX = x - width / tailLength * i;
    const tailWidth = width - width / tailLength * i;
    const alpha = 1 - i / tailLength;
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // Gold color with fading alpha
    ctx.beginPath();
    ctx.moveTo(tailX + width, y);
    ctx.arcTo(tailX + tailWidth, y, tailX + tailWidth, y + height, 4);
    ctx.arcTo(tailX + tailWidth, y + height, tailX, y + height, 4);
    ctx.arcTo(tailX, y + height, tailX, y, 4);
    ctx.arcTo(tailX, y, tailX + tailWidth, y, 4);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSparkles(x, y, width, height) {
  const sparkleCount = 3; // Number of sparkles per bullet
  ctx.fillStyle = "white";
  for (let i = 0; i < sparkleCount; i++) {
    const sparkleX = x + Math.random() * width;
    const sparkleY = y + Math.random() * height;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

document.addEventListener("keydown", movePlayer);
document.addEventListener("keyup", stopPlayer);

// Bomb-specific variables
let lastBombTime = 0; // Time when the last bomb was deployed
const bombCooldown = 700; // Cooldown period for bombs (700ms)
const bombBatteryConsumption = 25; // Battery consumption for bombs
const bombEffectRadius = 100; // Radius of bomb explosion
let bombEffectStartTime = 0; // Time when bomb effect started
let isBombDeployed = false; // Flag to check if bomb is deployed

function deployBomb() {
  const currentTime = Date.now();

  // Check if enough time has passed, and if there is enough battery to deploy a bomb
  if (
    currentTime - lastBombTime >= bombCooldown &&
    battery >= bombBatteryConsumption
  ) {
    // Apply bomb effect to enemies
    handleBombExplosions();

    // Deduct battery and update last bomb time
    battery -= bombBatteryConsumption;
    lastBombTime = currentTime;
    bombEffectStartTime = currentTime; // Track the start time for the effect
    isBombDeployed = true; // Mark the bomb as deployed

    // Ensure bomb cooldown resets
    setTimeout(() => {
      isBombDeployed = false;
    }, bombCooldown); // Reset the bomb effect after cooldown
  }
}

function drawBombEffect() {
  if (isBombDeployed) {
    const effectDuration = 1000; // Duration of the explosion effect in milliseconds
    const fadeOutDuration = 200; // Duration of the fade-out effect
    const timeElapsed = Date.now() - bombEffectStartTime;

    // Calculate the scaling factor for the radius
    const scaleFactor = Math.min(timeElapsed / effectDuration, 1);
    const radius = bombEffectRadius * scaleFactor;

    // Calculate opacity for smooth fade-in and fade-out
    let opacity;
    if (timeElapsed < effectDuration - fadeOutDuration) {
      // Smooth fade-in with an ease-out curve
      opacity = 1 - Math.pow(1 - scaleFactor, 3);
    } else {
      // Smooth fade-out
      const fadeOutScale =
        (timeElapsed - (effectDuration - fadeOutDuration)) / fadeOutDuration;
      opacity = Math.max(0, Math.pow(1 - fadeOutScale, 3));
    }

    // Create a radial gradient for the explosion effect
    const gradient = ctx.createRadialGradient(
      player.x + player.width / 2, // Center x-coordinate of the explosion
      player.y + player.height / 2, // Center y-coordinate of the explosion
      0, // Inner radius of the gradient
      player.x + player.width / 2,
      player.y + player.height / 2,
      radius // Outer radius of the gradient
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${opacity})`); // Bright yellow at the center
    gradient.addColorStop(0.5, `rgba(255, 165, 0, ${opacity * 0.8})`); // Orange at the midpoint
    gradient.addColorStop(1, `rgba(255, 69, 0, ${opacity * 0.6})`); // Red at the edges

    // Draw the explosion effect with the gradient
    ctx.save(); // Save the canvas state
    ctx.globalCompositeOperation = "lighter"; // Use lighter blending mode for glowing effect
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      player.x + player.width / 2, // Center x-coordinate of the arc
      player.y + player.height / 2, // Center y-coordinate of the arc
      radius, // Radius of the arc
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore(); // Restore the canvas state

    // Reset bomb deployment status after the effect duration ends
    if (timeElapsed >= effectDuration) {
      isBombDeployed = false;
    }
  }
}

function handleBombExplosions() {
  const currentTime = Date.now();
  if (currentTime - lastBombTime < 200) {
    let indicatorOffset = 0;
    const adjustedMaxDamage = 7.0 * 1.05; // Increased max damage by 5 percent

    // Handle enemy damage
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - enemyCenterX, 2) +
        Math.pow(playerCenterY - enemyCenterY, 2)
      );

      if (distance <= bombEffectRadius) {
        // Calculate constant damage based on distance
        const constantDamage = Math.max(0, 1 - (distance / bombEffectRadius)); // Decreases from 1 to 0

        let damage =
          adjustedMaxDamage * (1 - distance / bombEffectRadius) +
          constantDamage; // Damage scales with distance and adds constant damage

        // Implementing double damage chance between 8% and 12%
        let doubleDamageChance = 0.12; // Start with a 12% chance for double damage
        doubleDamageChance -= (i * 0.04) / enemies.length; // Decrease chance linearly to a minimum of 8%

        if (Math.random() < doubleDamageChance) {
          damage += 0.36; // Add double constant damage
        }

        // Check if the enemy has a shield
        if (enemy.shield > 0) {
          const baseShieldDamage = 2; // Base damage that the shield can absorb
          let shieldDamage = Math.min(damage, enemy.shield + baseShieldDamage); // Calculate shield damage

          // If the shield can absorb the damage
          if (shieldDamage > 0) {
            enemy.shield -= shieldDamage; // Reduce shield strength
            damage -= shieldDamage; // Reduce damage by the amount absorbed by the shield

            // If the shield is depleted, set it to 0
            if (enemy.shield < 0) {
              enemy.shield = 0;
            }

            // Add a visual indicator for shield damage
            damageIndicators.push({
              x: enemyCenterX,
              y: enemyCenterY + indicatorOffset,
              text: `Shield -${shieldDamage.toFixed(1)}`, // Show the exact shield damage dealt
              lifetime: 30,
              color: "blue", // Color for shield damage indicator
            });
          }
        }

        // Apply remaining damage to enemy health
        enemy.health -= damage;

        // Determine gradient based on damage dealt
        let variation = damage / adjustedMaxDamage; // Normalize damage to a value between 0 and 1
        let gradient;
        if (variation < 0.13) {
          gradient = "linear-gradient(to bottom, blue, green)";
        } else if (variation < 0.36) {
          gradient = "linear-gradient(to bottom, red, yellow)";
        } else {
          gradient = "linear-gradient(to bottom, purple, orange)";
        }

        damageIndicators.push({
          x: enemyCenterX,
          y: enemyCenterY + indicatorOffset,
          text: damage.toFixed(1),
          lifetime: 30,
          gradient: gradient
        });

        indicatorOffset += 20;

        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 10;
          coins += 1;
          i--; // Adjust index after removal
        }
      }
    }

    // Handle asteroid damage
    for (let j = 0; j < asteroids.length; j++) {
      const asteroid = asteroids[j];
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const asteroidCenterX = asteroid.x + asteroid.width / 2;
      const asteroidCenterY = asteroid.y + asteroid.height / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - asteroidCenterX, 2) +
        Math.pow(playerCenterY - asteroidCenterY, 2)
      );

      if (distance <= bombEffectRadius) {
        // Calculate constant damage based on distance
        const constantDamage = Math.max(0, 1 - (distance / bombEffectRadius)); // Decreases from 1 to 0

        // Use the average damage dealt to enemies to influence asteroid damage
        let averageEnemyDamage = adjustedMaxDamage * 0.5; // Example: average damage for balancing
        let damage =
          averageEnemyDamage * (1 - distance / bombEffectRadius) +
          constantDamage + 0.5; // Added constant damage

        // Calculate gradient multiplier based on enemy damage
        let gradientMultiplier = 1 + (averageEnemyDamage / adjustedMaxDamage) * 0.01; // 1% increase based on enemy damage
        damage *= gradientMultiplier;

        const doubleDamageChance = 0.08 + (Math.random() * (0.19 - 0.11) + 0.11);

        if (Math.random() < doubleDamageChance) {
          damage *= 2; // Double the damage
        }

        asteroid.health -= damage;

        // Determine gradient based on damage dealt
        let variation = damage / (adjustedMaxDamage + 0.5); // Normalize damage to a value between 0 and 1
        if (variation < 0.20) {
          gradient = "linear-gradient(to bottom, blue, green)";
        } else if (variation < 0.42) {
          gradient = "linear-gradient(to bottom, red, yellow)";
        } else {
          gradient = "linear-gradient(to bottom, purple, orange)";
        }

        damageIndicators.push({
          x: asteroidCenterX,
          y: asteroidCenterY + indicatorOffset,
          text: damage.toFixed(1),
          lifetime: 30,
          gradient: gradient
        });

        indicatorOffset += 20;

        if (asteroid.health <= 0) {
          asteroids.splice(j, 1);
          score += 20; // Adjust score for asteroid
          j--; // Decrement the counter for proper array iteration
        }
    }
  }
}
}

function movePlayer(e) {
  if (e.key === "ArrowLeft") {
    player.dx = -player.speed;
  } else if (e.key === "ArrowRight") {
    player.dx = player.speed;
  }
}

function stopPlayer(e) {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    player.dx = 0; // Stop horizontal movement
  }
}

// Cooling down the overheat level over time
setInterval(() => {
  if (overheatLevel > 0) {
    overheatLevel -= overheatCooldownRate;
  }
  if (overheatLevel < 0) {
    overheatLevel = 0;
  }
}, 1000); // Decrease overheat level every second

// Stop shooting when the spacebar is released
function stopShooting(e) {
  if (e.key === " ") {
    isShooting = false;
    clearInterval(shootIntervalID); // Stop shooting
  }
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bullets[i].speed;

    // Remove bullets when they go off screen
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

// Add event listeners (assuming you have a game loop or update function)
//document.addEventListener("keydown", shootBullet); // Uncomment if shooting is triggered by spacebar press
document.addEventListener("keyup", stopShooting);

function updatePlayer() {
  player.x += player.dx;
  // Prevent the player from moving off the screen
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
}

let coins = 0; // Add a variable to track coins collected

function drawCoins() {
  // Enable anti-aliasing for smoother rendering of shapes and text
  ctx.imageSmoothingEnabled = true;

  // Set font and style for text
  ctx.fillStyle = "White";
  ctx.font = "20px Arial";

  // Add shadow for better text visibility
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;

  // Draw the label text ("Coins:")
  ctx.fillText("Coins:", 10, 60); // Position for the label text

  // Draw the coins count
  ctx.fillText(`${coins}`, 80, 60); // Position for the coin count text

  // Reset shadow to avoid affecting other drawings
  ctx.shadowBlur = 0;
}

// Function to trigger damage effect (to be called when the player is hit)
function triggerDamageEffect() {
  player.damageEffect = { time: 30 }; // Effect lasts for 30 frames
}

// Updated drawPlayer function with collision visuals
function drawPlayer() {
  // Check if the player is in a "damaged" state
  const isDamaged = player.damageEffect && player.damageEffect.time > 0;

  // Flicker effect by alternating colors when damaged
  if (isDamaged) {
    player.damageEffect.time--; // Decrease the damage effect time
    ctx.fillStyle = (player.damageEffect.time % 10 < 5) ? "#FFD580" : player.skin.color; // Damaged flicker color
  } else {
    ctx.fillStyle = player.skin.color; // Use the current skin color
  }

  // Draw the main body of the spaceship (a triangle for a classic look)
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y); // Tip of the spaceship
  ctx.lineTo(player.x, player.y + player.height); // Bottom-left corner
  ctx.lineTo(player.x + player.width, player.y + player.height); // Bottom-right corner
  ctx.closePath();
  
  // Add a gradient to the spaceship body
  const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
  gradient.addColorStop(0, ctx.fillStyle);
  gradient.addColorStop(1, "#A0522D"); // Darker shade for depth
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw the cockpit (a small circle near the tip)
  ctx.fillStyle = isDamaged ? "darkred" : "blue"; // Cockpit changes color when damaged
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 2,
    player.y + player.height / 3,
    player.width / 6,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw the engines (two small rectangles at the bottom corners)
  ctx.fillStyle = isDamaged ? "darkgray" : "gray"; // Engines change color when damaged
  ctx.fillRect(
    player.x + player.width / 6,
    player.y + player.height,
    player.width / 6,
    player.height / 4
  );
  ctx.fillRect(
    player.x + player.width * 2 / 3,
    player.y + player.height,
    player.width / 6,
    player.height / 4
  );

  // Add shadows to the engines for depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Shadow color
  ctx.fillRect(
    player.x + player.width / 6,
    player.y + player.height + 2, // Slightly offset for shadow
    player.width / 6,
    player.height / 4
  );
  ctx.fillRect(
    player.x + player.width * 2 / 3,
    player.y + player.height + 2, // Slightly offset for shadow
    player.width / 6,
    player.height / 4
  );

  // Optional: Draw an outline or glow around the player when damaged
  if (isDamaged) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "5") {
    const index = parseInt(e.key) - 1; // Convert key to index (0-4)
    if (index >= 0 && index < playerSkins.length) {
      currentSkinIndex = index; // Update the current skin index
      player.skin = playerSkins[currentSkinIndex]; // Update the player's skin
    }
  }
});

function checkGameOver() {
  if (player.health <= 0) {
    return true;
  }
  return false;
}

function drawGameOver() {
  // Load the game over sound
  const gameOverSound = new Audio("gameOverSound.mp3"); // Provide the path to your sound file

  // Play the sound
  gameOverSound.play();

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2 - 60);
  ctx.font = "20px Arial";
  ctx.fillText(
    `Final Score: ${score}`,
    canvas.width / 2 - 60,
    canvas.height / 2
  );
  ctx.fillText(
    `Coins Collected: ${coins}`,
    canvas.width / 2 - 80,
    canvas.height / 2 + 40
  );
  ctx.fillText(
    "Press 'R' to Restart",
    canvas.width / 2 - 80,
    canvas.height / 2 + 80
  );

  // Array of motivational quotes
  const quotes = [
    "Don't stop when you're tired. Stop when you're done.",
    "Every failure is a step closer to success.",
    "Winners never quit, and quitters never win.",
    "The harder the battle, the sweeter the victory.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Push yourself because no one else is going to do it for you.",
    "Believe you can, and you're halfway there.",
    "It's not whether you get knocked down; it's whether you get up.",
    "Failure is simply the opportunity to begin again, this time more intelligently.",
    "Dream big, work hard, stay focused, and surround yourself with good people."
  ];

  // Select a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Display the random quote
  ctx.font = "18px Arial";
  ctx.fillStyle = "white"; // Set the text color to white
  ctx.fillText(
    randomQuote,
    canvas.width / 2 - ctx.measureText(randomQuote).width / 2,
    canvas.height / 2 + 120
  );
}

document.addEventListener("keydown", restartGame);

function restartGame(e) {
  if (e.key === "r" || e.key === "R") {
    // Reset game variables
    player.health = 125;
    player.x = canvas.width / 2 - playerWidth / 2;
    player.y = canvas.height - playerHeight - 10;
    player.dx = 0;

    bullets = [];
    enemies = [];
    score = 0;
    coins = 0;
    battery = 5000;

    // Reset the cooldown timers
    lastShotTime = 0;
    lastBatteryCooldownTime = 0;
    lastBombTime = 0;
    lastBatteryRegenTime = 0;
    bombEffectStartTime = 0;

    // Restart the game loop
    gameLoop();
  }
}

// Initialize variables for score and high score

let highScore = 0;
const marginTop = 50; // Set the margin at the top

function drawScore() {
  // Enable anti-aliasing for smoother text
  ctx.imageSmoothingEnabled = true;

  // Set font and style
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";

  // Add a shadow for better text visibility
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;

  // Draw the score text with margin
  ctx.fillText(`Score: ${score}`, 10, marginTop + 30);

  // Draw the high score text with margin
  ctx.fillText(`Highscore: ${highScore}`, 10, marginTop + 60);

  // Reset shadow to avoid affecting other drawings
  ctx.shadowBlur = 0;
}

// Call this function whenever the score is updated to update the high score as well
function updateScore() {
  if (score > highScore) {
    highScore = score; // Update high score if the current score is higher
  }
}

// Call this function whenever the score is updated to update the high score as well

function drawPlayerHealthBar() {
  const barWidth = 20; // Width of the health bar
  const barHeight = 125; // Height of the health bar
  const canvasWidth = ctx.canvas.width; // Width of the canvas
  const xPosition = canvasWidth - barWidth - 50; // Position the bar 50px from the right edge
  const yPosition = 10; // Top position of the bar

  // Ensure player health is within the valid range
  const validHealth = Math.max(0, Math.min(player.health, barHeight));

  ctx.fillStyle = "gray";
  ctx.fillRect(xPosition, yPosition, barWidth, barHeight); // Draw the background of the health bar

  ctx.fillStyle = "red";
  ctx.fillRect(
    xPosition,
    yPosition + (barHeight - validHealth), // Adjust the position based on the player's health
    barWidth,
    validHealth // Ensure the health doesn't exceed the bar's height
  ); // Draw the foreground of the health bar
}

// Function to recharge the battery over time
// Time tracking for battery regeneration (1 unit per second)
let lastBatteryRegenTime = 0; // Last time the battery was regenerated
// Cooldown variables
let lastBatteryCooldownTime = 0; // Time when the last battery consumption was triggered
const batteryCooldownPeriod = 700; // Cooldown period for battery consumption in milliseconds (700ms)

// Battery system variables
let battery = 5000; // Current battery level (out of 5000)
const batteryMax = 5000; // Maximum battery level
const batteryRechargeRate = 7.0; // Recharge rate

function rechargeBattery() {
  const currentTime = Date.now();

  // Check if at least 1 second has passed since the last regeneration
  if (battery < batteryMax && currentTime - lastBatteryRegenTime >= 1000) {
    battery += batteryRechargeRate; // Recharge based on the new rate
    if (battery > batteryMax) {
      battery = batteryMax; // Ensure battery does not exceed maximum
    }
    lastBatteryRegenTime = currentTime; // Update the last regeneration time
  }
}

// Drawing the battery bar
function drawBatteryBar() {
  const barWidth = 20; // Width of the battery bar
  const barHeight = 200; // Fixed height of the battery bar for visual representation
  const xPosition = 10; // Position from the left side of the canvas
  const yPosition = canvas.height - barHeight - 10; // Position from the bottom, accounting for padding

  // Ensure battery level is not negative
  if (battery < 0) {
    battery = 0;
  }

  // Draw the background of the battery bar
  ctx.fillStyle = "gray";
  ctx.fillRect(xPosition, yPosition, barWidth, barHeight);

  // Draw the foreground of the battery bar (green area)
  ctx.fillStyle = "green";
  ctx.fillRect(
    xPosition,
    yPosition + (barHeight - (battery / batteryMax) * barHeight), // Adjust Y position for the current battery level
    barWidth,
    (battery / batteryMax) * barHeight // Foreground height proportional to battery level
  );

  // Draw the battery level text
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Battery: ${battery.toFixed(2)}/${batteryMax}`, xPosition, yPosition - 10);
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let paused = false; // Track if the game is paused

document.addEventListener("keydown", togglePause);

function togglePause(e) {
  if (e.key === "Escape") {
    // Press 'Escape' to pause/resume
    paused = !paused; // Toggle the paused state
    if (!paused) {
      gameLoop(); // Resume the game loop if unpaused
    }
  }
}

let pauseTime = 0; // Tracks elapsed time (not used for movement now)

function drawPauseScreen() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw floating particles
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = (Math.random() * canvas.height + pauseTime) % canvas.height;
    const size = Math.random() * 3 + 1;

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw "PAUSED" text with debug background
  ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Debug background
  ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 60, 200, 50); // Debug box

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 30);

  // Draw "Press 'Esc' to Resume" text
  ctx.font = "20px Arial";
  ctx.fillText(
    "Press 'Esc' to Resume",
    canvas.width / 2,
    canvas.height / 2 + 30
  );
}

// Create a new Audio object for background music
const bgMusic = new Audio("spacebg1.mp3");

// Set the audio to loop indefinitely
bgMusic.loop = true;

// Set the initial audio volume to 0 (muted)
bgMusic.volume = 50;

// Function to fade in the music
function fadeInAudio(duration) {
  let startVolume = 0;
  let endVolume = 0.2; // Final volume after fade-in
  let increment = (endVolume - startVolume) / (duration / 50); // Adjust the increment to fit the duration

  let fadeInInterval = setInterval(() => {
    if (bgMusic.volume < endVolume) {
      bgMusic.volume += increment;
    } else {
      clearInterval(fadeInInterval); // Stop when target volume is reached
    }
  }, 50); // 50ms interval for smooth fade-in
}

// Function to fade out the music
function fadeOutAudio(duration) {
  let startVolume = bgMusic.volume;
  let endVolume = 0; // Final volume after fade-out
  let increment = (startVolume - endVolume) / (duration / 50); // Adjust the increment to fit the duration

  let fadeOutInterval = setInterval(() => {
    if (bgMusic.volume > endVolume) {
      bgMusic.volume -= increment;
    } else {
      clearInterval(fadeOutInterval); // Stop when target volume is reached
      bgMusic.pause(); // Optionally pause the music once faded out
    }
  }, 50); // 50ms interval for smooth fade-out
}

// Play the background music when the game starts and fade it in
bgMusic.play();
fadeInAudio(3000); // Fade in over 3 seconds

// Add event listener to handle fade-out when needed (e.g., game over or pause)
bgMusic.addEventListener("ended", () => {
  fadeOutAudio(3000); // Fade out over 3 seconds
});

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
