let shield = {
    active: false,
    radius: 50, // Radius of the shield
    health: 100, // Health of the shield
    color: "rgba(0, 0, 255, 0.5)", // Color of the shield
    regenRate: 5, // Health regeneration rate per activation
    regenInterval: 2000, // Time interval for regeneration in milliseconds
    cooldown: 9000, // Initial cooldown period in milliseconds
    fastCooldown: 3000, // Fast cooldown duration in milliseconds
    minCooldown: 3000, // Minimum cooldown duration to prevent it from going too low
    activeDuration: 20000, // Active duration in milliseconds
    lastActivated: 0, // Timestamp of when the shield was last activated
    temperature: 0, // Current temperature of the shield
    maxTemperature: 60, // Maximum temperature before overheating
    temperatureIncreaseRate: 6, // Rate at which temperature increases per update
    coolingRate: 5, // Rate at which the shield cools down
    damageEffect: {
        active: false,
        duration: 30, // Duration of the effect in frames
        frameCount: 0, // Frame counter for the effect
    },
    crack: {
        active: false,
        severity: 0, // Severity of the crack (0 to 100)
    },
};

let lastRegenTime = 0; // Track the last time the shield was regenerated

document.addEventListener("keydown", (e) => {
    if (e.key === "s") {
        const currentTime = Date.now();
        
        // Check if the shield is currently active
        if (!shield.active && shield.temperature < shield.maxTemperature) {
            // Activate the shield if it's not already active and not overheated
            shield.active = true;
            shield.lastActivated = currentTime; // Record the activation time
            
            // Increase cooldown by 10% each time the shield is activated
            shield.cooldown = Math.max(shield.cooldown * 1.1, shield.minCooldown); // Ensure cooldown does not go below minCooldown
            
            // Apply fast cooldown
            shield.cooldown = shield.fastCooldown; // Set to fast cooldown duration
        } else if (shield.temperature >= shield.maxTemperature) {
            // Shield is overheated, cannot activate
            console.log("Shield is overheated!");
        } else {
            // Check if the cooldown period has passed
            if (currentTime - shield.lastActivated >= shield.cooldown) {
                shield.active = false; // Deactivate the shield
            }
        }
    }
});

function updateShield() {
    const currentTime = Date.now();

    if (shield.active) {
        // Increase temperature while the shield is active
        shield.temperature = shield.temperature + shield.temperatureIncreaseRate; // Increase temperature per update

        // Regenerate shield health over time
        if (currentTime - lastRegenTime >= shield.regenInterval) {
            shield.health = shield.health + shield.regenRate;

            // Cap the shield health at 100
            if (shield.health > 100) {
                shield.health = 100;
            }

            lastRegenTime = currentTime; // Update last regeneration time
        }

        // Check if the active duration has passed
        if (currentTime - shield.lastActivated >= shield.activeDuration) {
            shield.active = false; // Deactivate the shield after the active duration
        }

        // Check if shield health is zero or below
        if (shield.health <= 0) {
            shield.active = false; // Deactivate the shield if health is zero
            shield.health = 0; // Ensure health does not go negative
        }

        // Handle damage effect
        if (shield.damageEffect.active) {
            shield.damageEffect.frameCount++;
            if (shield.damageEffect.frameCount >= shield.damageEffect.duration) {
                shield.damageEffect.active = false; // Deactivate the damage effect after the duration
            }
        }

        // Increase crack severity based on health
        if (shield.health < 50) {
            shield.crack.active = true;
            shield.crack.severity = (50 - shield.health) * 2; // Scale severity from 0 to 100
        } else {
            shield.crack.active = false;
            shield.crack.severity = 0; // Reset severity if health is above 50
        }
    } else {
        // Cool down the shield temperature when inactive
        if (shield.temperature > 0) {
            shield.temperature = shield.temperature - shield.coolingRate; // Decrease temperature
            if (shield.temperature < 0) {
                shield.temperature = 0; // Ensure temperature does not go negative
            }
        }
    }
}

function drawShield() {
    if (shield.active) {
        // Draw the shield with a transparent color
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shield.radius,
            0,
            Math.PI * 2
        );

        // Change color if the damage effect is active
        if (shield.damageEffect.active) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red color for damage effect
        } else {
            ctx.fillStyle = "rgba(0, 0, 255, 0.3)"; // Blue color for normal shield
        }
        ctx.fill();
        ctx.closePath();

        // Optional: Draw the shield health bar background
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Red color for health bar background with 30% opacity
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shield.radius + 5, // Slightly larger than the shield
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // White outline with 50% opacity
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw the shield health
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Green color for remaining health with 50% opacity
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shield.radius * (shield.health / 100), // Scale the radius based on health
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.closePath();

        // Draw the temperature indicator
        ctx.fillStyle = "rgba(255, 165, 0, 0.5)"; // Orange color for temperature
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shield.radius + 10, // Slightly larger than the shield
            0,
            Math.PI * 2
        );
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Red outline for temperature
        ctx.stroke();
        ctx.closePath();

        // Draw the crack effect if active
        if (shield.crack.active) {
            ctx.strokeStyle = "rgba(255, 255, 0, 0.8)"; // Yellow color for cracks
            ctx.lineWidth = 2 + (shield.crack.severity / 100) * 4; // Increase line width based on severity
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2 - shield.radius + shield.crack.severity, player.y + player.height / 2);
            ctx.lineTo(player.x + player.width / 2 + shield.radius - shield.crack.severity, player.y + player.height / 2);
            ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2 - shield.radius + shield.crack.severity);
            ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2 + shield.radius - shield.crack.severity);
            ctx.stroke();
        }
    }
}