"use strict";

var damageIndicators = [];

function detectCollisions() {
  detectBulletEnemyCollisions();
  detectEnemyPlayerCollisions();
  handleBombExplosions();
  updateDamageIndicators();
}

function detectBulletEnemyCollisions() {
  var enemycollisionSound = new Audio("collision-sound.mp3");
  enemycollisionSound.volume = 0.2;

  for (var i = 0; i < bullets.length; i++) {
    for (var j = 0; j < enemies.length; j++) {
      if (bullets[i].x < enemies[j].x + enemies[j].width && bullets[i].x + bullets[i].width > enemies[j].x && bullets[i].y < enemies[j].y + enemies[j].height && bullets[i].y + bullets[i].height > enemies[j].y) {
        var distance = Math.sqrt(Math.pow(enemies[j].x - bullets[i].x, 2) + Math.pow(enemies[j].y - bullets[i].y, 2));
        var damageModifier = 1;

        if (distance > 100) {
          damageModifier = 0.5;
        } else if (distance < 50) {
          damageModifier = 1.2;
        }

        var modifiedDamage = bullets[i].damage * damageModifier;
        enemies[j].health -= modifiedDamage;
        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: modifiedDamage.toFixed(2),
          lifetime: 30,
          color: getRandomColor()
        });

        if (enemies[j].health <= 0) {
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

function detectEnemyPlayerCollisions() {
  var collisionSound = new Audio("collision-sound.mp3");
  collisionSound.volume = 0.2;

  for (var i = 0; i < enemies.length; i++) {
    if (player.x < enemies[i].x + enemies[i].width && player.x + player.width > enemies[i].x && player.y < enemies[i].y + enemies[i].height && player.y + player.height > enemies[i].y) {
      var damage = 2;

      if (enemies[i].color === "grey") {
        damage = 3;
      } else if (enemies[i].color === "white") {
        damage = 4;
      } else if (enemies[i].color === "silver") {
        damage = 6;
      } else if (enemies[i].color === "purple") {
        damage = 8;
      } else {
        damage = 2;
      }

      var critChance = Math.random() * 100;

      if (critChance < 25) {
        damage *= 2;
      }

      player.health -= damage;
      triggerDamageEffect();
      damageIndicators.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        text: damage,
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
  var currentTime = Date.now();

  if (currentTime - lastBombTime < 200) {
    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      var distance = Math.sqrt(Math.pow(player.x + player.width / 2 - (enemy.x + enemy.width / 2), 2) + Math.pow(player.y + player.height / 2 - (enemy.y + enemy.height / 2), 2));

      if (distance <= bombEffectRadius) {
        enemy.health -= 7.0;
        damageIndicators.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          text: 7,
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

  for (var _i = 0; _i < bullets.length; _i++) {
    for (var j = 0; j < enemies.length; j++) {
      if (bullets[_i].x < enemies[j].x + enemies[j].width && bullets[_i].x + bullets[_i].width > enemies[j].x && bullets[_i].y < enemies[j].y + enemies[j].height && bullets[_i].y + bullets[_i].height > enemies[j].y) {
        enemies[j].health -= bullets[_i].damage;

        if (bullets[_i].type === "ice") {
          enemies[j].speed *= iceGunSlowdownEffect;
          damageIndicators.push({
            x: enemies[j].x + enemies[j].width / 2,
            y: enemies[j].y + enemies[j].height / 2,
            text: "Frozen",
            lifetime: 30,
            color: "blue"
          });
        }

        bullets.splice(_i, 1);
        _i--;
        break;
      }
    }
  }
}

function updateDamageIndicators() {
  for (var i = 0; i < damageIndicators.length; i++) {
    damageIndicators[i].y -= 1;
    damageIndicators[i].lifetime--;

    if (damageIndicators[i].lifetime <= 0) {
      damageIndicators.splice(i, 1);
      i--;
    }
  }
}

var enemycollisionSound = new Audio("collision-sound.mp3");
enemycollisionSound.volume = 0.2; // Set the volume to full (equivalent to 10 on a 0-10 scale)
// Missile collision logic

function checkMissileCollisions() {
  for (var i = 0; i < missiles.length; i++) {
    for (var j = 0; j < enemies.length; j++) {
      if (missiles[i].x < enemies[j].x + enemies[j].width && missiles[i].x + missiles[i].width > enemies[j].x && missiles[i].y < enemies[j].y + enemies[j].height && missiles[i].y + missiles[i].height > enemies[j].y) {
        // Apply missile damage to the enemy
        enemies[j].health -= missiles[i].damage; // Create a floating damage indicator

        damageIndicators.push({
          x: enemies[j].x + enemies[j].width / 2,
          y: enemies[j].y + enemies[j].height / 2,
          text: missiles[i].damage,
          lifetime: 30,
          // How long the indicator lasts
          color: getRandomColor() // Assign a random color

        }); // If the enemy's health is less than or equal to 0, remove it

        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          score += 20; // Increment the score

          coins += 9; // Increment coins by 1 for each enemy destroyed

          j--; // Adjust index after removal
        } // Play the collision sound when a missile hits an enemy


        enemycollisionSound.play(); // Remove the missile after collision

        missiles.splice(i, 1);
        i--; // Adjust index after removal

        break;
      }
    }
  }
}

function getRandomColor() {
  var colors = [{
    color: "red",
    weight: 25
  }, {
    color: "orange",
    weight: 13
  }, {
    color: "yellow",
    weight: 14
  }, {
    color: "#FFFFE0",
    weight: 25
  }, // Light yellow
  {
    color: "#FFA07A",
    weight: 33
  } // Light orange
  ];
  var totalWeight = colors.reduce(function (sum, entry) {
    return sum + entry.weight;
  }, 0);
  var randomNum = Math.random() * totalWeight;
  var cumulativeWeight = 0;

  for (var _i2 = 0, _colors = colors; _i2 < _colors.length; _i2++) {
    var entry = _colors[_i2];
    cumulativeWeight += entry.weight;

    if (randomNum <= cumulativeWeight) {
      return entry.color;
    }
  }
} // Function to draw the damage indicators


function drawDamageIndicators() {
  for (var i = 0; i < damageIndicators.length; i++) {
    ctx.fillStyle = damageIndicators[i].color; // Use the assigned color

    ctx.font = "20px Arial";
    ctx.fillText(damageIndicators[i].text, damageIndicators[i].x, damageIndicators[i].y);
  }
}

var icecollisionSound = new Audio("Collision Sound Effect.mp3"); // Load the collision sound file

var damageSound = new Audio("Damage Sound Effect.mp3"); // Load the damage sound file

function detectIceBulletCollisions(enemies) {
  for (var i = 0; i < iceBullets.length; i++) {
    for (var j = 0; j < enemies.length; j++) {
      var bullet = iceBullets[i];
      var enemy = enemies[j]; // Collision detection logic

      if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
        // Collision detected, apply base damage
        enemy.health -= bullet.damage; // Apply incremental damage and effects from the ice bullet

        applyIceEffect(enemy, bullet); // Show ice damage indicator
        // (Assuming you have a function for this)
        // Show the numerical damage indicator

        showDamageNumber(enemy, bullet.damage); // Play the collision sound

        icecollisionSound.play(); // play damage sound

        damageSound.play(); // Check if the enemy's health is 0 or below, and remove them from the array

        if (enemy.health <= 0) {
          // Remove the enemy from the enemies array
          enemies.splice(j, 1);
          j--; // Adjust index due to removal of the enemy
          // Increment score and coins

          score += 30; // Add 30 points for defeating the enemy

          coins += 8; // Add 8 coins for defeating the enemy
        } // Remove the ice bullet after hit


        iceBullets.splice(i, 1);
        i--; // Adjust index due to removal of the bullet

        break; // Exit the loop once the bullet collides with an enemy
      }
    }
  }
}

var indicators = []; // Function to show numerical damage indicator

function showDamageNumber(enemy, damage) {
  // Remove any previous damage indicators for this enemy
  indicators = indicators.filter(function (indicator) {
    return !(indicator.enemy === enemy);
  }); // Create a new damage number indicator object

  var damageNumber = {
    enemy: enemy,
    // Store the enemy reference to identify and replace later
    x: enemy.x + enemy.width / 2,
    // Position at the center of the enemy
    y: enemy.y - 30,
    // Slightly above the enemy
    text: "-".concat(damage),
    // Show the numerical damage amount
    color: "#C2DFE1",
    // Color of the damage number
    size: 24,
    // Updated text size for the damage number (22px)
    duration: 1.0 // Duration for the effect in seconds

  }; // Push the damage number to the indicators array

  indicators.push(damageNumber); // Remove the damage number after the specified duration

  setTimeout(function () {
    var index = indicators.indexOf(damageNumber);

    if (index > -1) {
      indicators.splice(index, 1); // Remove the damage number after duration
    }
  }, damageNumber.duration * 1000);
} // Function to render the indicators (e.g., on a canvas)


function renderIndicators(ctx) {
  // Loop through all active indicators and render them
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = indicators[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var indicator = _step.value;
      ctx.fillStyle = indicator.color;
      ctx.font = "".concat(indicator.size, "px Arial"); // Use the updated size here

      ctx.fillText(indicator.text, indicator.x, indicator.y); // Animate the indicator's movement (e.g., move it upwards and fade out)

      indicator.y -= 2; // Move upward

      indicator.size *= 0.98; // Fade text by shrinking font size (optional)
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}