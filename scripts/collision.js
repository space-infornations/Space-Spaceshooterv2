let damageIndicators = [];

function detectCollisions() {
  detectBulletEnemyCollisions();
  detectEnemyPlayerCollisions();
  handleBombExplosions();
  updateDamageIndicators();
  detectElectricBulletEnemyCollisions();
}

const particles = [];
function detectBulletEnemyCollisions() {
  const enemycollisionSound = new Audio("collision.mp3");
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
          damageModifier = 1.01; // 1% increase for short range
        }

        // Base damage capped at a maximum of 2
        const baseDamage = Math.min(bullets[i].damage, 2);

        // Increase damage by 0.1
        const modifiedDamage = (baseDamage + 0.1) * damageModifier;
        enemies[j].health -= modifiedDamage;

        // Set the damaged property to true
        enemies[j].damaged = true;

        // Reset the damaged state after a short duration
        setTimeout(() => {
          enemies[j].damaged = false;
        }, 100); // Change the duration as needed

        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: modifiedDamage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
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
    const angle = (i / particleCount) * Math.PI * 2; // Calculate the angle for circular distribution
    const speed = Math.random() * 2 + 1; // Random speed for each particle
    const size = Math.random() * 5 + 1; // Random size for each particle
    const colors = ["red", "orange", "yellow"]; // Array of colors
    const color = colors[Math.floor(Math.random() * colors.length)]; // Random color selection

    particles.push({
      x: x,
      y: y,
      xSpeed: Math.cos(angle) * speed,
      ySpeed: Math.sin(angle) * speed,
      size: size,
      color: color,
      lifetime: 60,
      deceleration: deceleration, // Adding deceleration to particles
    });
  }
}
function detectElectricBulletEnemyCollisions() {
  const enemyCollisionSound = new Audio("collision.mp3");
  enemyCollisionSound.volume = 0.2;

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
        if (distance < 50) {
          damage = baseDamage; // Normal damage for short range
        } else if (distance < 100) {
          damage = baseDamage * (1 - distance / 100); // Linear decrease from 100% to 0% based on distance
        } else {
          damage = baseDamage * 1.02; // 2% increase for long range
        }

        // Apply damage reduction based on bullet index
        const damageReductionFactor = 0.05; // 5% reduction per bullet
        const damageMultiplier = 1 - i * damageReductionFactor; // Reduce damage based on bullet index
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
          color: getRandomColor(),
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
        enemyCollisionSound.play();
        electricBullets.splice(i, 1); // Remove the electric bullet
        i--; // Adjust index after removal
        break; // Exit the inner loop
      }
    }
  }
}

function detectElectricBulletAsteroidCollisions() {
  const asteroidCollisionSound = new Audio("collision.mp3");
  asteroidCollisionSound.volume = 0.2;

  for (let i = 0; i < electricBullets.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (
        electricBullets[i].x < asteroids[j].x + asteroids[j].width &&
        electricBullets[i].x + electricBullets[i].width > asteroids[j].x &&
        electricBullets[i].y < asteroids[j].y + asteroids[j].height &&
        electricBullets[i].y + electricBullets[i].height > asteroids[j].y
      ) {
        // Base damage for electric bullets with a maximum value of 5
        const baseDamage = Math.min(3, 5);

        // Calculate the distance between the bullet and the asteroid
        const distance = Math.sqrt(
          (asteroids[j].x + asteroids[j].width / 2 - (electricBullets[i].x + electricBullets[i].width / 2)) ** 2 +
          (asteroids[j].y + asteroids[j].height / 2 - (electricBullets[i].y + electricBullets[i].height / 2)) ** 2
        );

        // Determine damage amount based on distance
        let damage;
        if (distance < 100) {
          if (distance < 50) {
            damage = (baseDamage * (1 - distance / 100) + 0.02); // Increased damage for short range
          } else {
            damage = (baseDamage * (1 - distance / 100)); // Linear decrease for mid range
          }
        } else {
          damage = baseDamage * 0.95; // 5% decrease for long range or more
        }

        // Ensure damage does not go below zero
        damage = Math.max(0, damage);

        // Apply the damage to the asteroid's health
        asteroids[j].health -= damage;

        // Create a damage indicator
        damageIndicators.push({
          x: asteroids[j].x + asteroids[j].width / 2,
          y: asteroids[j].y + asteroids[j].height / 2,
          text: damage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
        });

        // Check if the asteroid is destroyed
        if (asteroids[j].health <= 0) {
          createRedParticles(
            asteroids[j].x + asteroids[j].width / 2,
            asteroids[j].y + asteroids[j].height / 2
          );
          asteroids.splice(j, 1); // Remove the asteroid from the array
          score += 5; // Adjust score for asteroid destruction
          j--; // Adjust index after removal to avoid skipping the next asteroid
        }

        // Play collision sound
        asteroidCollisionSound.play();
        electricBullets.splice(i, 1); // Remove the electric bullet
        i--; // Adjust index after removal
        break; // Exit the inner loop
      }
    }
  }
}

function updateParticles() {
  particles.forEach((particle) => {
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
          color: "green",
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
        color: getRandomColor(),
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
    let indicatorOffset = 0;
    const adjustedMaxDamage = Math.min(2.0 * 0.95, 7); // Reduced max damage by 5 percent, capped at 7
    const constantDamage = 0.3;

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
        let damage = adjustedMaxDamage * (1 - distance / bombEffectRadius) + constantDamage; // Damage scales with distance and adds constant damage

        // Implementing double damage chance between 8% and 12%
        let doubleDamageChance = 0.12; // Start with a 12% chance for double damage
        doubleDamageChance -= (i * 0.04) / enemies.length; // Decrease chance linearly to a minimum of 8%

        if (Math.random() < doubleDamageChance) {
          damage *= 2; // Double the damage
        }

        enemy.health -= damage;

        damageIndicators.push({
          x: enemyCenterX,
          y: enemyCenterY + indicatorOffset, // Use indicatorOffset to avoid overlap
          text: damage.toFixed(1), // Show the exact damage dealt
          lifetime: 30,
        });

        indicatorOffset += 20; // Increment the offset to avoid overlap for the next indicator

        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 10;
          coins += 1;
          i--;
        }
      }
    }
  }


  //ice bullet damage
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        bullets[i].x < enemies[j].x + enemies[j].width &&
        bullets[i].x + bullets[i].width > enemies[j].x &&
        bullets[i].y < enemies[j].y + enemies[j].height &&
        bullets[i].y + bullets[i].height > enemies[j].y
      ) {
        // Base damage capped at a maximum of 5
        const baseDamage = Math.min(bullets[i].damage, 5);
  
        // Calculate the distance between the bullet and the enemy
        const distance = Math.sqrt(
          (enemies[j].x + enemies[j].width / 2 - (bullets[i].x + bullets[i].width / 2)) ** 2 +
          (enemies[j].y + enemies[j].height / 2 - (bullets[i].y + bullets[i].height / 2)) ** 2
        );
  
        // Adjust damage based on distance
        let damage;
        if (distance < 50) {
          damage = baseDamage * 1.04; // Increase damage by 4% for short range
        } else if (distance < 100) {
          damage = baseDamage * (1 - distance / 100); // Linear decrease from 100% to 0% based on distance
        } else {
          damage = baseDamage * 0.95; // Decrease damage by 5% for long range
        }
  
        // Apply the damage to the enemy's health
        enemies[j].health -= damage;
  
        if (bullets[i].type === "ice") {
          enemies[j].speed *= iceGunSlowdownEffect;
  
          damageIndicators.push({
            x: enemies[j].x + enemies[j].width / 2,
            y: enemies[j].y + enemies[j].height / 2,
            text: "Frozen",
            lifetime: 30,
            color: "blue",
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
        baseDamage = Math.min(baseDamage, 7); // Cap base damage at 7
        let damage = isMultihit
          ? baseDamage * increasedDamageMultiplier
          : baseDamage;

        // Adjust damage based on range
        const distance = Math.sqrt(
          (enemies[j].x - missiles[i].x) ** 2 +
          (enemies[j].y - missiles[i].y) ** 2
        );

        if (distance < 50) {
          damage *= 1.04; // Increase damage by 4% for short range
        } else if (distance > 100) {
          damage *= 1.03; // Increase damage by 3% for long range
        }

        // Apply missile damage to the enemy
        enemies[j].health -= damage;

        // Create a floating damage indicator
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: damage.toFixed(2), // Display damage with decimal values
          lifetime: 30, // How long the indicator lasts
          color: getRandomColor(), // Assign a random color
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
    { color: "#FFA07A", weight: 33 }, // Light orange
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
        // Base damage capped at a maximum of 10
        const baseDamage = Math.min(bullet.damage + 2, 10);

        // Calculate the distance between the bullet and the enemy
        const distance = Math.sqrt(
          (enemy.x + enemy.width / 2 - (bullet.x + bullet.width / 2)) ** 2 +
          (enemy.y + enemy.height / 2 - (bullet.y + bullet.height / 2)) ** 2
        );

        // Adjust damage based on distance
        let damage;
        if (distance < 50) {
          damage = baseDamage * 1.04; // Increase damage by 4% for short range
        } else if (distance < 100) {
          damage = baseDamage * (1 - distance / 100); // Linear decrease from 100% to 0% based on distance
        } else {
          damage = baseDamage * 0.95; // Decrease damage by 5% for long range
        }

        // Apply default damage fluctuation of ±20%
        const defaultFluctuation = 0.2; // 20% fluctuation
        const fluctuation = damage * defaultFluctuation;
        damage = damage + (Math.random() * 2 * fluctuation - fluctuation);

        // Ensure the default damage range is between 1.2 and 2.2 and add fluctuation
        const minDamage = 1.2;
        const maxDamage = 10; // Max damage capped at 10
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

          // Increment score, coins, and balance
          score += 30; // Add 30 points for defeating the enemy
          coins += 8; // Add 8 coins for defeating the enemy
          balance += 50; // Add 50 to the player's balance for defeating the enemy
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
  indicators = indicators.filter((indicator) => !(indicator.enemy === enemy));

  // Create a new damage number indicator object
  const damageNumber = {
    enemy: enemy, // Store the enemy reference to identify and replace later
    x: enemy.x + enemy.width / 2, // Position at the center of the enemy
    y: enemy.y - 30, // Slightly above the enemy
    text: `-${damage}`, // Show the numerical damage amount
    color: "#C2DFE1", // Color of the damage number
    size: 24, // Updated text size for the damage number (22px)
    duration: 1.0, // Duration for the effect in seconds
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
