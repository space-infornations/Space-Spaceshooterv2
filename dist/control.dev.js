"use strict";

document.addEventListener("keydown", function (e) {
  if (e.key === "z") {
    // Press "Z" to shoot ice weapon
    shootIceBullet();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "m") {
    // Press "M" to shoot a missile
    shootMissile();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "b") {
    // Press "B" to deploy a bomb
    deployBomb();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    // Check if the spacebar is pressed
    shootBullet(e);
  }
});