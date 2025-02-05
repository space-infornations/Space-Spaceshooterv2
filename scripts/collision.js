let damageIndicators = [];

function detectCollisions() {
  detectBulletEnemyCollisions();
  detectEnemyPlayerCollisions();
  handleBombExplosions();
  updateDamageIndicators();
}

const particles = [];
function detectBulletEnemyCollisions() {
  const enemycollisionSound = new Audio("collison.mp3");
  enemycollisionSound.volume = 0.2;

  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        bullets[i].x < enemies[j].x + enemies[j].width &&
        bullets[i].x + bullets[i].width > enemies[j].x &&
        bullets[i].y < enemies[j].y + enemies[j].height &&
        bullets[i].y + bullets[i].height > enemies[j].y
      ) {
        const distance = Math.sqrt(
          (enemies[j].x - bullets[i].x) ** 2 +
            (enemies[j].y - bullets[i].y) ** 2
        );

        let damageModifier = 1;
        if (distance > 100) {
          damageModifier = 0.5;
        } else if (distance < 50) {
          damageModifier = 1.2;
        }

        const modifiedDamage = bullets[i].damage * damageModifier;
        enemies[j].health -= modifiedDamage;

        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: modifiedDamage.toFixed(2),
          lifetime: 30,
          color: getRandomColor()
        });

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

        enemycollisionSound.play();
        bullets.splice(i, 1);
        i--;
        break;
      }
    }
  }
}

function createRedParticles(x, y) {
  const particleCount = 30;
  const deceleration = 0.98; // Deceleration factor to smoothen movement

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: x,
      y: y,
      xSpeed: (Math.random() - 0.5) * 2,
      ySpeed: (Math.random() - 0.5) * 2,
      size: Math.random() * 5 + 1,
      color: "red",
      lifetime: 60,
      deceleration: deceleration // Adding deceleration to particles
    });
  }
}

function updateParticles() {
  particles.forEach(particle => {
    particle.x += particle.xSpeed;
    particle.y += particle.ySpeed;
    particle.xSpeed *= particle.deceleration; // Applying deceleration
    particle.ySpeed *= particle.deceleration; // Applying deceleration
    particle.lifetime--;

    // Remove particle if its lifetime is over
    if (particle.lifetime <= 0) {
      particles.splice(particles.indexOf(particle), 1);
    }
  });
}

function drawParticles(ctx) {
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
}

// Initialize a counter for enemy collisions
let collisionCount = 0;

function detectEnemyPlayerCollisions() {
  const collisionSound = new Audio("enemyhit.mp3");
  collisionSound.volume = 0.2;

  for (let i = 0; i < enemies.length; i++) {
    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      let damage = 1.29;

      if (enemies[i].color === "grey") {
        damage = 2.2;
      } else if (enemies[i].color === "white") {
        damage = 4.29;
      } else if (enemies[i].color === "silver") {
        damage = 5.99;
      } else if (enemies[i].color === "purple") {
        damage = 7.4;
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, blue, green)"
      ) {
        damage = 12 * 1.05; // Increase by 5%
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, red, yellow)"
      ) {
        damage = 14 * 1.05; // Increase by 5%
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, purple, orange)"
      ) {
        damage = 16 * 1.05; // Increase by 5%
      } else {
        damage = 2;
      }

      const critChance = Math.random() * 100;
      if (critChance < 25) {
        damage *= 2;
      }

      // Increase the collision counter
      collisionCount++;

      if (collisionCount % 3 === 0) {
        // Generate a random percentage between 0.5% (0.005) and 9% (0.09)
        const randomPercentage = 0.005 + Math.random() * 0.085;
        const healthIncrease = player.health * randomPercentage;
        player.health += healthIncrease;

        // Show health increase indicator
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "+" + healthIncrease.toFixed(2),
          lifetime: 30,
          color: "green"
        });
      }

      // Subtract the damage
      player.health -= damage;

      triggerDamageEffect();

      // Show damage indicator
      damageIndicators.push({
        x: player.x - player.width / 2, // Change + to -
        y: player.y - player.height / 2, // Change + to -
        text: "-" + damage.toFixed(2),
        lifetime: 30,
        color: getRandomColor()
      });

      collisionSound.play();
      enemies.splice(i, 1);
      i--;
    }
  }
}

function handleBombExplosions() {
  const currentTime = Date.now();
  if (currentTime - lastBombTime < 200) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const distance = Math.sqrt(
        Math.pow(player.x + player.width / 2 - (enemy.x + enemy.width / 2), 2) +
          Math.pow(
            player.y + player.height / 2 - (enemy.y + enemy.height / 2),
            2
          )
      );

      if (distance <= bombEffectRadius) {
        const maxDamage = 7.0;
        let damage = maxDamage * (1 - distance / bombEffectRadius); // Damage scales with distance

        // Implementing the chance for double damage between 12% and 24%
        let doubleDamageChance = 0.24; // Start with a 24% chance for double damage
        doubleDamageChance -= i * 0.12 / enemies.length; // Decrease chance linearly to a minimum of 12%

        if (Math.random() < doubleDamageChance) {
          damage *= 2;
        }

        enemy.health -= damage;

        damageIndicators.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2 + i * 5, // Add vertical offset to avoid overlap
          text: damage.toFixed(1), // Show the exact damage dealt
          lifetime: 30
        });

        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 10;
          coins += 1;
          i--;
        }
      }
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        bullets[i].x < enemies[j].x + enemies[j].width &&
        bullets[i].x + bullets[i].width > enemies[j].x &&
        bullets[i].y < enemies[j].y + enemies[j].height &&
        bullets[i].y + bullets[i].height > enemies[j].y
      ) {
        enemies[j].health -= bullets[i].damage;

        if (bullets[i].type === "ice") {
          enemies[j].speed *= iceGunSlowdownEffect;

          damageIndicators.push({
            x: enemies[j].x + enemies[j].width / 2,
            y: enemies[j].y + enemies[j].height / 2,
            text: "Frozen",
            lifetime: 30,
            color: "blue"
          });
        }

        bullets.splice(i, 1);
        i--;
        break;
      }
    }
  }
}

function updateDamageIndicators() {
  for (let i = 0; i < damageIndicators.length; i++) {
    damageIndicators[i].y -= 1;
    damageIndicators[i].lifetime--;
    if (damageIndicators[i].lifetime <= 0) {
      damageIndicators.splice(i, 1);
      i--;
    }
  }
}

const enemycollisionSound = new Audio("collision-sound.mp3");
enemycollisionSound.volume = 0.2; // Set the volume to full (equivalent to 10 on a 0-10 scale)

// Missile collision logic
function checkMissileCollisions() {
  const defaultDamage = 1.0; // Weaker default damage
  const minChance = 0.05; // Minimum chance for increased damage
  const maxChance = 0.24; // Maximum chance for increased damage
  const increasedDamageMultiplier = 1.5; // 50% increased damage for multihits

  for (let i = 0; i < missiles.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        missiles[i].x < enemies[j].x + enemies[j].width &&
        missiles[i].x + missiles[i].width > enemies[j].x &&
        missiles[i].y < enemies[j].y + enemies[j].height &&
        missiles[i].y + missiles[i].height > enemies[j].y
      ) {
        // Determine if this is a multihit with increased damage
        let multihitChance =
          Math.random() * (maxChance - minChance) + minChance;
        let isMultihit = Math.random() < multihitChance;
        let fluctuation = (Math.random() - 0.5) * 2; // Generates a value between -1 and 1
        let baseDamage = defaultDamage * (1 + fluctuation * 0.25); // Up to ±25% of the base damage
        let damage = isMultihit
          ? baseDamage * increasedDamageMultiplier
          : baseDamage;

        // Apply missile damage to the enemy
        enemies[j].health -= damage;

        // Create a floating damage indicator
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: damage.toFixed(2), // Display damage with decimal values
          lifetime: 30, // How long the indicator lasts
          color: getRandomColor() // Assign a random color
        });

        // If the enemy's health is less than or equal to 0, remove it
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          score += 10; // Weaker score increment
          coins += 5; // Weaker coin increment
          j--; // Adjust index after removal
        }

        // Play the collision sound when a missile hits an enemy
        enemycollisionSound.play();

        // Remove the missile after collision
        missiles.splice(i, 1);
        i--; // Adjust index after removal
        break;
      }
    }
  }
}

function getRandomColor() {
  const colors = [
    { color: "red", weight: 25 },
    { color: "orange", weight: 13 },
    { color: "yellow", weight: 14 },
    { color: "#FFFFE0", weight: 25 }, // Light yellow
    { color: "#FFA07A", weight: 33 } // Light orange
  ];

  const totalWeight = colors.reduce((sum, entry) => sum + entry.weight, 0);
  const randomNum = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const entry of colors) {
    cumulativeWeight += entry.weight;
    if (randomNum <= cumulativeWeight) {
      return entry.color;
    }
  }
}

// Function to draw the damage indicators
function drawDamageIndicators() {
  for (let i = 0; i < damageIndicators.length; i++) {
    ctx.fillStyle = damageIndicators[i].color; // Use the assigned color
    ctx.font = "20px Arial";
    ctx.fillText(
      damageIndicators[i].text,
      damageIndicators[i].x,
      damageIndicators[i].y
    );
  }
}

const icecollisionSound = new Audio("Collision Sound Effect.mp3"); // Load the collision sound file
const damageSound = new Audio("Damage Sound Effect.mp3"); // Load the damage sound file

function detectIceBulletCollisions(enemies) {
  for (let i = 0; i < iceBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      const bullet = iceBullets[i];
      const enemy = enemies[j];

      // Collision detection logic
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Collision detected, apply base damage
        let damage = bullet.damage + 12; // Increase ice bullet damage by 12

        // Apply default damage fluctuation of ±20%
        const defaultFluctuation = 0.2; // 20% fluctuation
        const fluctuation = damage * defaultFluctuation;
        damage = damage + (Math.random() * 2 * fluctuation - fluctuation);

        // Ensure the default damage range is between 1.2 and 2.2 and add fluctuation
        const minDamage = 1.2;
        const maxDamage = 2.2;
        damage = Math.max(minDamage, Math.min(maxDamage, damage));

        if (enemy.gradient === "linear-gradient(to bottom, blue, green)") {
          damage *= 1.05; // Increase by 5%
        } else if (
          enemy.gradient === "linear-gradient(to bottom, red, yellow)"
        ) {
          damage *= 1.05; // Increase by 5%
        } else if (
          enemy.gradient === "linear-gradient(to bottom, purple, orange)"
        ) {
          damage *= 1.05; // Increase by 5%
        } else {
          damage =
            2 +
            (Math.random() * 2 * (2 * defaultFluctuation) -
              2 * defaultFluctuation); // Ensure default damage with fluctuation
        }

        // Round the damage to 2 decimal places
        damage = Math.round(damage * 100) / 100;

        enemy.health -= damage;

        // Apply incremental damage and effects from the ice bullet
        applyIceEffect(enemy, bullet);

        // Show ice damage indicator
        // (Assuming you have a function for this)

        // Show the numerical damage indicator
        showDamageNumber(enemy, damage);

        // Play the collision sound
        icecollisionSound.play();

        // Play damage sound
        damageSound.play();

        // Check if the enemy's health is 0 or below, and remove them from the array
        if (enemy.health <= 0) {
          // Remove the enemy from the enemies array
          enemies.splice(j, 1);
          j--; // Adjust index due to removal of the enemy

          // Increment score and coins
          score += 30; // Add 30 points for defeating the enemy
          coins += 8; // Add 8 coins for defeating the enemy
        }

        // Remove the ice bullet after hit
        iceBullets.splice(i, 1);
        i--; // Adjust index due to removal of the bullet
        break; // Exit the loop once the bullet collides with an enemy
      }
    }
  }
}

let indicators = [];

// Function to show numerical damage indicator
function showDamageNumber(enemy, damage) {
  // Remove any previous damage indicators for this enemy
  indicators = indicators.filter(indicator => !(indicator.enemy === enemy));

  // Create a new damage number indicator object
  const damageNumber = {
    enemy: enemy, // Store the enemy reference to identify and replace later
    x: enemy.x + enemy.width / 2, // Position at the center of the enemy
    y: enemy.y - 30, // Slightly above the enemy
    text: `-${damage}`, // Show the numerical damage amount
    color: "#C2DFE1", // Color of the damage number
    size: 24, // Updated text size for the damage number (22px)
    duration: 1.0 // Duration for the effect in seconds
  };

  // Push the damage number to the indicators array
  indicators.push(damageNumber);

  // Remove the damage number after the specified duration
  setTimeout(() => {
    const index = indicators.indexOf(damageNumber);
    if (index > -1) {
      indicators.splice(index, 1); // Remove the damage number after duration
    }
  }, damageNumber.duration * 1000);
}

// Function to render the indicators (e.g., on a canvas)
function renderIndicators(ctx) {
  // Loop through all active indicators and render them
  for (const indicator of indicators) {
    ctx.fillStyle = indicator.color;
    ctx.font = `${indicator.size}px Arial`; // Use the updated size here
    ctx.fillText(indicator.text, indicator.x, indicator.y);

    // Animate the indicator's movement (e.g., move it upwards and fade out)
    indicator.y -= 2; // Move upward
    indicator.size *= 0.98; // Fade text by shrinking font size (optional)
  }
}
