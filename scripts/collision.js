let damageIndicators = [];

function detectCollisions() {
  detectBulletEnemyCollisions();
  detectEnemyPlayerCollisions();
  handleBombExplosions();
  updateDamageIndicators();
  detectElectricBulletEnemyCollisions();
  detectIceBulletAsteroidCollisions(); // Add this line
  checkMissileAsteroidCollisions();
}

const particles = [];

function detectAsteroidPlayerCollisions() {
  for (let j = asteroids.length - 1; j >= 0; j--) { // Loop backwards for asteroids
    if (
      asteroids[j].x < player.x + player.width &&
      asteroids[j].x + asteroidWidth > player.x &&
      asteroids[j].y < player.y + player.height &&
      asteroids[j].y + asteroidHeight > player.y
    ) {
      const baseDamage = 5; // Set base damage to 5
      const criticalHitChance = 0.2; // 20% chance for a critical hit
      const isCriticalHit = Math.random() < criticalHitChance; // Determine if it's a critical hit

      // Calculate total damage
      const totalDamage = isCriticalHit ? baseDamage * 2 : baseDamage; // Double damage on critical hit

      // Check if the shield is active
      if (shield.active) {
        // Subtract damage from shield first
        shield.health -= totalDamage;

        // Check if the shield is depleted
        if (shield.health < 0) {
          // If shield is depleted, apply remaining damage to player health
          player.health += shield.health; // shield.health is negative, so this effectively subtracts the remaining damage
          shield.health = 0; // Ensure shield health does not go negative
        }

        // Activate damage effect
        shield.damageEffect.active = true;
        shield.damageEffect.frameCount = 0; // Reset frame count

        // Show shield damage indicator
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "-" + totalDamage.toFixed(2) + " (Shield)",
          lifetime: 30,
          color: "blue", // Color for shield damage indicator
        });
      } else {
        // If shield is not active, apply damage directly to player health
        player.health -= totalDamage;

        // Create damage indicators for player
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "-" + totalDamage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
        });
      }

      // Remove the asteroid after it hits the player
      asteroids.splice(j, 1); // Remove the asteroid after it hits the player
      break; // Exit the loop after a collision
    }
  }
}
function detectBulletEnemyCollisions() {
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        bullets[i].x < enemies[j].x + enemies[j].width &&
        bullets[i].x + bullets[i].width > enemies[j].x &&
        bullets[i].y < enemies[j].y + enemies[j].height &&
        bullets[i].y + bullets[i].height > enemies [j].y
      ) {
        const distance = Math.sqrt(
          (enemies[j].x + enemies[j].width / 2 - (bullets[i].x + bullets[i].width / 2)) ** 2 +
          (enemies[j].y + enemies[j].height / 2 - (bullets[i].y + bullets[i].height / 2)) ** 2
        );

        let damage;
        // Use the bullet's damage value
        const baseDamage = bullets[i].damage;

        // Check if the bullet is a dual bullet
        if (bullets[i].isDual) {
          damage = baseDamage;

          // Adjust damage based on distance
          if (distance < 50) {
            damage *= 0.3; // Decrease damage by 70% if close
          } else if (distance > 100) {
            damage *= 0.2; // Decrease damage by 80% if far
          }
        } else {
          damage = baseDamage;

          // Adjust damage based on distance
          if (distance < 50) {
            damage *= 1.2; // Increase damage by 20% if close
          } else if (distance > 100) {
            damage *= 0.8; // Decrease damage by 20% if far
          }
        }

        damage += (Math.random() * 0.2 - 0.1) * damage; // ±10% fluctuation
        damage = Math.max(1, Math.min(7, damage)); // Ensure damage is between 1 and 7

        // Check if the enemy has a shield
        if (enemies[j].shield > 0) {
          const baseShieldDamage = 1.0; // Base damage that the shield can absorb
          let shieldDamage = Math.min(damage, enemies[j].shield + baseShieldDamage); // Calculate shield damage

          // If the shield can absorb the damage
          if (shieldDamage > 0) {
            enemies[j].shield -= shieldDamage; // Reduce shield strength
            damage -= shieldDamage; // Reduce damage by the amount absorbed by the shield

            // If the shield is depleted, set it to 0
            if (enemies[j].shield < 0) {
              enemies[j].shield = 0;
            }

            // Add a visual indicator for shield damage
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: `Shield -${shieldDamage.toFixed(2)}`,
              lifetime: 30,
              color: getRandomColor(), // Color for shield damage indicator
            });
          }
        }

        // Apply remaining damage to enemy health
        if (damage > 0) {
          enemies[j].health -= damage;

          // Set the damaged property to true
          enemies[j].damaged = true;

          // Reset the damaged state after a short duration
          setTimeout(() => {
            enemies[j].damaged = false;
          }, 100); // Change the duration as needed

          damageIndicators.push({
            x: enemies[j].x + enemies[j].width / 2,
            y: enemies[j].y + enemies[j].height / 2,
            text: damage.toFixed(2),
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
            coins += 3;
            j--;
          }
        }

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
  for (let i = 0; i < electricBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        electricBullets[i].x < enemies[j].x + enemies[j].width &&
        electricBullets[i].x + electricBullets[i].width > enemies[j].x &&
        electricBullets[i].y < enemies[j].y + enemies[j].height &&
        electricBullets[i].y + electricBullets[i].height > enemies[j].y
      ) {
        const baseDamage = Math.min(electricBullets[i].damage, 5); // Adjusted max damage
        const distance = Math.sqrt(
          (enemies[j].x + enemies[j].width / 2 - (electricBullets[i].x + electricBullets[i].width / 2)) ** 2 +
          (enemies[j].y + enemies[j].height / 2 - (electricBullets[i].y + electricBullets[i].height / 2)) ** 2
        );

        let damageModifier = 1;
        if (distance < 50) {
          damageModifier = 1.1; // Slight increase for short range
        } else if (distance > 100) {
          damageModifier = 0.9; // Slight decrease for long range
        }

        let damage = baseDamage * damageModifier;
        damage += (Math.random() * 0.2 - 0.1) * damage; // ±10% fluctuation
        damage = Math.max(1, Math.min(7, damage)); // Ensure damage is between 1 and 7

        // Check if the enemy has a shield
        if (enemies[j].shield > 0) {
          const baseShieldDamage = 2; // Base damage that the shield can absorb
          let shieldDamage = Math.min(damage, enemies[j].shield + baseShieldDamage); // Calculate shield damage

          // If the shield can absorb the damage
          if (shieldDamage > 0) {
            enemies[j].shield -= shieldDamage; // Reduce shield strength
            damage -= shieldDamage; // Reduce damage by the amount absorbed by the shield

            // If the shield is depleted, set it to 0
            if (enemies[j].shield < 0) {
              enemies[j].shield = 0;
            }

            // Add a visual indicator for shield damage
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: `Shield -${shieldDamage.toFixed(2)}`,
              lifetime: 30,
              color: getRandomColor(), // Corrected to call the function
            });
          }
        }

        // Apply remaining damage to enemy health
        if (damage > 0) {
          enemies[j].health -= damage;

          damageIndicators.push({
            x: enemies[j].x + enemies[j].width / 2,
            y: enemies[j].y + enemies[j].height / 2,
            text: damage.toFixed(2),
            lifetime: 30,
            color: getRandomColor(),
          });

          if (enemies[j].health <= 0) {
            createRedParticles(
              enemies[j].x + enemies[j].width / 2,
              enemies[j].y + enemies[j].height / 2
            );
            enemies.splice(j, 1);
            score += 40;
            coins += 6;
            j--; // Adjust index after removal
          }
        }

        electricBullets.splice(i, 1); // Remove the electric bullet
        i--; // Adjust index after removal
        break; // Exit the inner loop
      }
    }
  }
}

function detectElectricBulletAsteroidCollisions() {
  for (let i = 0; i < electricBullets.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (
        electricBullets[i].x < asteroids[j].x + asteroids[j].width &&
        electricBullets[i].x + electricBullets[i].width > asteroids[j].x &&
        electricBullets[i].y < asteroids[j].y + asteroids[j].height &&
        electricBullets[i].y + electricBullets[i].height > asteroids[j].y
      ) {
        const baseDamage = Math.min(3, 5); // Adjusted max damage
        const distance = Math.sqrt(
          (asteroids[j].x + asteroids[j].width / 2 - (electricBullets[i].x + electricBullets[i].width / 2)) ** 2 +
          (asteroids[j].y + asteroids[j].height / 2 - (electricBullets[i].y + electricBullets[i].height / 2)) ** 2
        );

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

        damage = Math.max(1, Math.min(5, damage)); // Ensure damage is between 1 and 5

        asteroids[j].health -= damage;

        damageIndicators.push({
          x: asteroids[j].x + asteroids[j].width / 2,
          y: asteroids[j].y + asteroids[j].height / 2,
          text: damage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
        });

        if (asteroids[j].health <= 0) {
          createRedParticles(
            asteroids[j].x + asteroids[j].width / 2,
            asteroids[j].y + asteroids[j].height / 2
          );
          asteroids.splice(j, 1);
          score += 50; // Adjust score for asteroid destruction
          coins+= 19;
          j--; // Adjust index after removal
        }

        electricBullets.splice(i, 1); // Remove the electric bullet
        i--; // Adjust index after removal
        break; // Exit the inner loop
      }
    }
  }
}
// test collision will
function detectIceBulletAsteroidCollisions() {
  for (let i = 0; i < iceBullets.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      const bullet = iceBullets[i];
      const asteroid = asteroids[j];

      if (
        bullet.x < asteroid.x + asteroid.width &&
        bullet.x + bullet.width > asteroid.x &&
        bullet.y < asteroid.y + asteroid.height &&
        bullet.y + bullet.height > asteroid.y
      ) {
        const baseDamage = Math.min(bullet.damage + 2, 5);
        const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // Random factor between 0.9 and 1.1
        const adjustedBaseDamage = baseDamage * randomFactor;

        const distance = Math.sqrt(
          (asteroid.x + asteroid.width / 2 - (bullet.x + bullet.width / 2)) ** 2 +
          (asteroid.y + asteroid.height / 2 - (bullet.y + bullet.height / 2)) ** 2
        );

        let damage;
        if (distance < 50) {
          damage = adjustedBaseDamage * 1.25; // Increase damage by 25% for short range
        } else if (distance < 100) {
          damage = adjustedBaseDamage * (1 - (distance - 50) / 50); // Linear decrease from 25% to 0%
        } else {
          damage = adjustedBaseDamage * 0.8; // Decrease damage by 20% for long range
        }

        damage = Math.max(1, Math.min(5, damage)); // Ensure damage is between 1 and 5

        asteroid.health -= damage;

        damageIndicators.push({
          x: asteroid.x + asteroid.width / 2,
          y: asteroid.y + asteroid.height / 2,
          text: damage.toFixed(2),
          lifetime: 30,
          color: getRandomColor(),
        });

        if (asteroid.health <= 0) {
          createRedParticles(
            asteroid.x + asteroid.width / 2,
            asteroid.y + asteroid.height / 2
          );
          asteroids.splice(j, 1); // Remove the asteroid from the array
          score += 19; // Adjust score for asteroid destruction
          coins+= 12;
          j--; // Adjust index after removal to avoid skipping the next asteroid
        }

        iceBullets.splice(i, 1); // Remove the ice bullet
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
let collisionCount = 0; // Initialize a counter for collisions

function detectEnemyPlayerCollisions() {
  // const collisionSound = new Audio("enemyhit.mp3");
  // collisionSound.volume = 0.2;

  for (let i = 0; i < enemies.length; i++) {
    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      let damage = 1.29;

      // Determine damage based on enemy color or gradient
      if (enemies[i].color === "grey") {
        damage = 2.2;
      } else if (enemies[i].color === "white") {
        damage = 4.29;
      } else if (enemies[i].color === "silver") {
        damage = 5.99;
      } else if (enemies[i].color === "purple") {
        damage = 7.4;
      } else if (enemies[i].color === "darkblue") {
        damage = 9.0;
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, blue, green)"
      ) {
        damage = 12 * 1.05;
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, red, yellow)"
      ) {
        damage = 14 * 1.05;
      } else if (
        enemies[i].gradient === "linear-gradient(to bottom, purple, orange)"
      ) {
        damage = 16 * 1.05;
      } else {
        damage = 2;
      }

      // Critical hit chance
      const critChance = Math.random() * 100;
      if (critChance < 25) {
        damage *= 2; // Double damage on critical hit
      }

      // Check if the shield is active
      if (shield.active) {
        // Subtract damage from shield first
        shield.health -= damage;

        // Check if the shield is depleted
        if (shield.health < 0) {
          player.health += shield.health; // shield.health is negative, so this effectively subtracts the remaining damage
          shield.health = 0; // Ensure shield health does not go negative
        }

        // Show shield damage indicator
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "-" + damage.toFixed(2) + " (Shield)",
          lifetime: 30,
          color: "blue",
        });

        // Optional: Add visual feedback for shield damage
        shield.damageEffect.active = true;
        shield.damageEffect.frameCount = 0;
      } else {
        // Show player damage indicator
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "-" + damage.toFixed(2),
          lifetime: 30,
          color: "red",
        });
      }

      // Increment collision count
      collisionCount++;

      // Check if the player has collided with 3 enemies
      if (collisionCount === 3) {
        if (!shield.active) {
          player.health += 5; // Add health to the player

          // Show health gain indicator above the player
          damageIndicators.push({
            x: player.x + player.width / 2,
            y: player.y - 20,
            text: "+5 (Health)",
            lifetime: 30,
            color: "green",
          });
        }

        collisionCount = 0; // Reset the collision count
      }

      // Remove the enemy after collision
      enemies.splice(i, 1);
      i--; // Adjust index after removal
    }
  }

// Check for collisions with radiation particles
for (let j = 0; j < radiationParticles.length; j++) {
  if (
    player.x < radiationParticles[j].x + radiationParticleSize &&
    player.x + player.width > radiationParticles[j].x &&
    player.y < radiationParticles[j].y + radiationParticleSize &&
    player.y + player.height > radiationParticles[j].y
  ) {
    const baseRadiationDamage = 0.24; // Set base damage value for radiation
    const damageMultiplier = 5; // Base damage multiplier
    let totalDamage = baseRadiationDamage * damageMultiplier; // Initialize total damage with multiplier

    // Determine if a critical hit occurs
    const criticalHitChance = Math.random() * 100; // Random number between 0 and 100
    if (criticalHitChance >= 0 && criticalHitChance <= 25) { // Check if within critical hit chance
      const criticalDamage = Math.random() * 3; // Random critical damage between 0 and 3
      totalDamage += criticalDamage; // Add critical damage to total damage

      // Show critical damage indicator
      damageIndicators.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        text: "Critical Hit! -" + criticalDamage.toFixed(2),
        lifetime: 30,
        color: "red", // Color for critical damage indicator
      });
    }

    // Check for additional critical damage multiplier
    if (criticalHitChance >= 0 && criticalHitChance <= 11) { // Check if within additional critical damage chance
      totalDamage *= 2; // Apply additional multiplier to total damage
      // Show additional critical damage indicator
      damageIndicators.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        text: "Double Damage! x2",
        lifetime: 30,
        color: "orange", // Color for double damage indicator
      });
    }

    if (!shield.active) { // Check if the shield is not active
      player.health -= totalDamage; // Apply total damage to player

      // Show radiation damage indicator
      damageIndicators.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        text: "-" + totalDamage.toFixed(2) + " (Radiation)",
        lifetime: 30,
        color: "purple", // Color for radiation damage indicator
      });
    } else {
      // If the shield is active, absorb damage
      if (shield.health > 0) {
        // Calculate the damage absorbed by the shield
        const damageToShield = Math.min(totalDamage, shield.health);
        shield.health -= damageToShield; // Reduce shield health

        // Show shield absorption indicator
        damageIndicators.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          text: "Shield Absorbed: -" + damageToShield.toFixed(2),
          lifetime: 30,
          color: "blue", // Color for shield absorption indicator
        });

        // If the shield is depleted, deactivate it
        if (shield.health <= 0) {
          shield.active = false; // Deactivate the shield
        }
      }
    }

    // Remove the radiation particle after collision
    radiationParticles.splice(j, 1);
    j--; // Adjust index after removal
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

        damage = Math.max(1, Math.min(7, damage)); // Ensure damage is between 1 and 7

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
              y: enemyCenterY + indicatorOffset, // Use indicatorOffset to avoid overlap
              text: `Shield -${shieldDamage.toFixed(1)}`, // Show the exact shield damage dealt
              lifetime: 30,
              color: getRandomColor(), // Corrected to call the function
            });
          }
        }

        // Apply remaining damage to enemy health
        if (damage > 0) {
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
            score += 25;
            coins += 20;
            i--; // Adjust index after removal
          }
        }
      }
    }
  }

  // Ice bullet damage
  for (let i = 0; i < iceBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        iceBullets[i].x < enemies[j].x + enemies[j].width &&
        iceBullets[i].x + iceBullets[i].width > enemies[j].x &&
        iceBullets[i].y < enemies[j].y + enemies[j].height &&
        iceBullets[i].y + iceBullets[i].height > enemies[j].y
      ) {
        const baseDamage = Math.min(iceBullets[i].damage, 5); // Adjusted max damage
        const distance = Math.sqrt(
          (enemies[j].x + enemies[j].width / 2 - (iceBullets[i].x + iceBullets[i].width / 2)) ** 2 +
          (enemies[j].y + enemies[j].height / 2 - (iceBullets[i].y + iceBullets[i].height / 2)) ** 2
        );
  
        let damage;
        if (distance < 50) {
          damage = baseDamage * 1.04; // Increase damage by 4% for short range
        } else if (distance < 100) {
          damage = baseDamage * (1 - distance / 100); // Linear decrease from 100% to 0% based on distance
        } else {
          damage = baseDamage * 0.95; // Decrease damage by 5% for long range
        }
  
        damage = Math.max(1, Math.min(5, damage)); // Ensure damage is between 1 and 5
  
        // Check if the enemy has a shield
        if (enemies[j].shield > 0) {
          const baseShieldDamage = 2; // Base damage that the shield can absorb
          let shieldDamage = Math.min(damage, enemies[j].shield + baseShieldDamage); // Calculate shield damage
  
          // If the shield can absorb the damage
          if (shieldDamage > 0) {
            enemies[j].shield -= shieldDamage; // Reduce shield strength
            damage -= shieldDamage; // Reduce damage by the amount absorbed by the shield
  
            // If the shield is depleted, set it to 0
            if (enemies[j].shield < 0) {
              enemies[j].shield = 0;
            }
  
            // Add a visual indicator for shield damage
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: `Shield -${shieldDamage.toFixed(2)}`, // Show the exact shield damage dealt
              lifetime: 30,
              color: "blue", // Color for shield damage indicator
            });
          }
        }
  
        // Apply remaining damage to enemy health
        if (damage > 0) {
          enemies[j].health -= damage;
  
          // Add a frozen effect if the bullet type is ice
          if (iceBullets[i].type === "ice") {
            enemies[j].speed *= iceGunSlowdownEffect;
  
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: "Frozen",
              lifetime: 30,
              color: "blue",
            });
          }
  
          // Check if the enemy is defeated
          if (enemies[j].health <= 0) {
            enemies.splice(j, 1);
            score += 55; // Add points for defeating the enemy
            coins += 18; // Add coins for defeating the enemy
          }
        }
  
        // Remove the ice bullet after collision
        iceBullets.splice(i, 1);
        i--; // Adjust index after removal
        break; // Exit the inner loop
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

//const enemycollisionSound = new Audio("collision-sound.mp3");
//enemycollisionSound.volume = 0.2; // Set the volume to full (equivalent to 10 on a 0-10 scale)

// Missile collision logic
function checkMissileCollisions() {
  const defaultDamage = 2.0; // Increased default damage

  for (let i = 0; i < missiles.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (
        missiles[i].x < enemies[j].x + enemies[j].width &&
        missiles[i].x + missiles[i].width > enemies[j].x &&
        missiles[i].y < enemies[j].y + enemies[j].height &&
        missiles[i].y + missiles[i].height > enemies[j].y
      ) {
        let fluctuation = (Math.random() - 0.5) * 2; // Generates a value between -1 and 1
        let baseDamage = defaultDamage * (1 + fluctuation * 0.25); // Up to ±25% of the base damage
        baseDamage = Math.min(baseDamage, 10); // Cap base damage at 10 (increased cap)
        let damage = baseDamage;

        // Adjust damage based on range
        const distance = Math.sqrt(
          (enemies[j].x - missiles[i].x) ** 2 +
          (enemies[j].y - missiles[i].y) ** 2
        );

        if (distance < 50) {
          damage *= 1.10; // Increase damage by 10% for short range
        } else if (distance > 100) {
          damage *= 1.05; // Increase damage by 5% for long range
        }

        // Check if the enemy has a shield
        if (enemies[j].shield > 0) {
          const baseShieldDamage = 2; // Base damage that the shield can absorb
          let shieldDamage = Math.min(damage, enemies[j].shield + baseShieldDamage); // Calculate shield damage

          // If the shield can absorb the damage
          if (shieldDamage > 0) {
            enemies[j].shield -= shieldDamage; // Reduce shield strength
            damage -= shieldDamage; // Reduce damage by the amount absorbed by the shield

            // If the shield is depleted, set it to 0
            if (enemies[j].shield < 0) {
              enemies[j].shield = 0;
            }

            // Add a visual indicator for shield damage
            damageIndicators.push({
              x: enemies[j].x + enemies[j].width / 2,
              y: enemies[j].y + enemies[j].height / 2,
              text: `Shield -${shieldDamage.toFixed(2)}`, // Show the exact shield damage dealt
              lifetime: 30,
              color: "getRandomColor()", // Color for shield damage indicator
            });
          }
        }

        // Apply remaining damage to enemy health
        if (damage > 0) {
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
            score += 75; // Weaker score increment
            coins += 43; // Weaker coin increment
            j--; // Adjust index after removal
          }
        }

        // Play the collision sound when a missile hits an enemy
        // enemycollisionSound.play();

        // Remove the missile after collision
        missiles.splice(i, 1);
        i--; // Adjust index after removal
        break;
      }
    }
  }
}

function checkMissileAsteroidCollisions() {
  const defaultDamage = 1.0; // Weaker default damage

  for (let i = 0; i < missiles.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (
        missiles[i].x < asteroids[j].x + asteroids[j].width &&
        missiles[i].x + missiles[i].width > asteroids[j].x &&
        missiles[i].y < asteroids[j].y + asteroids[j].height &&
        missiles[i].y + missiles[i].height > asteroids[j].y
      ) {
        let fluctuation = (Math.random() - 0.5) * 2; // Generates a value between -1 and 1
        let baseDamage = defaultDamage * (1 + fluctuation * 0.25); // Up to ±25% of the base damage
        baseDamage = Math.min(baseDamage, 7); // Cap base damage at 7
        let damage = baseDamage;

        const distance = Math.sqrt(
          (asteroids[j].x - missiles[i].x) ** 2 +
          (asteroids[j].y - missiles[i].y) ** 2
        );

        if (distance < 50) {
          damage *= 1.04; // Increase damage by 4% for short range
        } else if (distance > 100) {
          damage *= 1.03; // Increase damage by 3% for long range
        }

        damage = Math.max(1, Math.min(7, damage)); // Ensure damage is between 1 and 7
        asteroids[j].health -= damage;

        damageIndicators.push({
          x: asteroids[j].x + asteroids[j].width / 2,
          y: asteroids[j].y + asteroids[j].height / 2,
          text: damage.toFixed(2), // Display damage with decimal values
          lifetime: 30, // How long the indicator lasts
          color: getRandomColor(), // Assign a random color
        });

        if (asteroids[j].health <= 0) {
          asteroids.splice(j, 1);
          score += 93; // Adjust score for asteroid destruction
          coins+= 12;
          j--; // Adjust index after removal
        }

        missiles.splice(i, 1);
        i--; // Adjust index after removal
        break; // Exit the inner loop
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

function detectIceBulletCollisions(enemies) {
  for (let i = 0; i < iceBullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      const bullet = iceBullets[i];
      const enemy = enemies[j];

      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        const baseDamage = Math.min(bullet.damage + 2, 10);
        const distance = Math.sqrt(
          (enemy.x + enemy.width / 2 - (bullet.x + bullet.width / 2)) ** 2 +
          (enemy.y + enemy.height / 2 - (bullet.y + bullet.height / 2)) ** 2
        );

        let damage;
        if (distance < 50) {
          damage = baseDamage * 1.04; // Increase damage by 4% for short range
        } else if (distance < 100) {
          damage = baseDamage * (1 - distance / 100); // Linear decrease from 100% to 0% based on distance
        } else {
          damage = baseDamage * 0.95; // Decrease damage by 5% for long range
        }

        damage = Math.max(1, Math.min(10, damage)); // Ensure damage is between 1 and 10

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
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              text: `Shield -${shieldDamage.toFixed(2)}`, // Show the exact shield damage dealt
              lifetime: 30,
              color: "blue", // Color for shield damage indicator
            });
          }
        }

        // Apply remaining damage to enemy health
        if (damage > 0) {
          enemy.health -= damage;

          // Apply ice effect
          applyIceEffect(enemy, bullet);

          damageIndicators.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            text: damage.toFixed(2),
            lifetime: 30,
          });

          if (enemy.health <= 0) {
            enemies.splice(j, 1);
            j--; // Adjust index due to removal of the enemy
            score += 30; // Add 30 points for defeating the enemy
            coins += 50; // Add coins for defeating the enemy
          }
        }

        // Remove the ice bullet after collision
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
