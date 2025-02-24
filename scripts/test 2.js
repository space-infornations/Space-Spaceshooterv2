const radiationParticles = [];
const maxRadiationParticles = 100; // Maximum number of radiation particles
const radiationParticleSpeed = 2; // Speed of falling particles
const radiationParticleSize = 5; // Size of each particle
const particleCreationInterval = 100; // Time in milliseconds between particle creations
let lastParticleCreationTime = 0; // Track the last time a particle was created

function createRadiationParticle() {
    if (radiationParticles.length < maxRadiationParticles) {
        radiationParticles.push({
            x: Math.random() * canvas.width, // Random x position
            y: 0, // Start from the top
            size: radiationParticleSize,
            opacity: Math.random() * 0.5 + 0.5 // Random opacity between 0.5 and 1
        });
    }
}

function updateRadiationParticles() {
    for (let i = radiationParticles.length - 1; i >= 0; i--) {
        radiationParticles[i].y += radiationParticleSpeed; // Move particle down

        // Remove particles that have fallen off the screen
        if (radiationParticles[i].y > canvas.height) {
            radiationParticles.splice(i, 1);
        }
    }
}

function drawRadiationParticles() {
    for (const particle of radiationParticles) {
        ctx.fillStyle = `rgba(0, 255, 0, ${particle.opacity})`; // Green color with opacity
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
