import { BehaviorSubject } from "rxjs";

// Get canvas context
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export const fruitCounterDiv = document.getElementById("fruitCounter");
export const scoreDiv = document.getElementById("score");
export const countdownDiv = document.getElementById("countdown");

export const isPlayerReady$ = new BehaviorSubject(false);
export const isFruitReady$ = new BehaviorSubject(false);
export const isMixerReady$ = new BehaviorSubject(false);

// Game variables
export const playerImage = new Image();
playerImage.src = "images/chef.gif";
playerImage.onload = () => {
  isPlayerReady$.next(true);
};
export const player = { x: 50, y: 50, width: 40, height: 40, speed: 10 };
export const fruitImage = new Image();
fruitImage.src = "images/apple.png";
fruitImage.width = 30;
fruitImage.height = 30;
fruitImage.onload = () => {
  isFruitReady$.next(true);
};
export const fruit = {
  x: fruitImage.width + Math.random() * (canvas.width - fruitImage.width * 2),
  y: fruitImage.height + Math.random() * (canvas.height - fruitImage.height * 2),
  width: fruitImage.width,
  height: fruitImage.height,
};
export const mixerImage = new Image();
mixerImage.src = "images/mixer.png";
mixerImage.width = 50;
mixerImage.height = 50;
mixerImage.onload = () => {
  isMixerReady$.next(true);
};

export const calculateNextMove = (key) =>
  ({
    ArrowUp: { x: 0, y: -player.speed },
    ArrowDown: { x: 0, y: player.speed },
    ArrowLeft: { x: -player.speed, y: 0 },
    ArrowRight: { x: player.speed, y: 0 },
  }[key] || { x: 0, y: 0 });

export const pot = {
  x: canvas.width - 50,
  y: 0,
  width: 50,
  height: 50,
};
export const kitchenCounter = { x: 0, y: 0, width: 50, height: 50 };

export const canvasCollision = (newPosition) =>
  newPosition.x < 0 ||
  newPosition.x + player.width > canvas.width ||
  newPosition.y < 0 ||
  newPosition.y + player.height > canvas.height;

export const potCollision = (newPosition) =>
  newPosition.x < pot.x + pot.width &&
  newPosition.x + player.width > pot.x &&
  newPosition.y < pot.y + pot.height &&
  newPosition.y + player.height > pot.y;

export const kitchenCounterCollision = (newPosition) =>
  newPosition.x < kitchenCounter.x + kitchenCounter.width &&
  newPosition.x + player.width > kitchenCounter.x &&
  newPosition.y < kitchenCounter.y + kitchenCounter.height &&
  newPosition.y + player.height > kitchenCounter.y;

export const fruitCollision = (newPosition) =>
  newPosition.x < fruit.x + fruit.width &&
  newPosition.x + player.width > fruit.x &&
  newPosition.y < fruit.y + fruit.height &&
  newPosition.y + player.height > fruit.y;

export const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

export const drawThePot = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(pot.x, pot.y, pot.width, pot.height);
  ctx.drawImage(mixerImage, pot.x, pot.y, mixerImage.width, mixerImage.height);
};
export const drawTheKitchenCounter = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(kitchenCounter.x, kitchenCounter.y, kitchenCounter.width, kitchenCounter.height);
};
export const drawThePlayer = (playerPos) => {
  if (playerPos) {
    player.x = playerPos.x;
    player.y = playerPos.y;
  }
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
};

export const drawFruit = () => {
  ctx.drawImage(fruitImage, fruit.x, fruit.y, fruit.width, fruit.height);
};
export const resetFruit = () => {
  // Place the fruit somewhere on the canvas randomly
  fruit.x = fruitImage.width + Math.random() * (canvas.width - fruitImage.width * 2);
  fruit.y = fruitImage.height + Math.random() * (canvas.height - fruitImage.height * 2);
};

// Game over
export const gameOverImage = new Image();
gameOverImage.src = "images/gameover.png";
const gameOverText = "GAME OVER";

export const renderGameOver = (position = { x: 0, y: canvas.height / 2 }) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the game over image
  ctx.drawImage(gameOverImage, (canvas.width - gameOverImage.width) / 2, position.y - gameOverImage.height / 2);

  // Display "GAME OVER" text
  ctx.font = "36px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(
    gameOverText,
    (canvas.width - ctx.measureText(gameOverText).width) / 2,
    position.y + gameOverImage.height / 2 + 36
  );
};
