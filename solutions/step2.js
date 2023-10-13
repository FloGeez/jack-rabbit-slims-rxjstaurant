// Etape 2 : Movement

import { filter, fromEvent, map, scan, startWith, switchMap, tap } from "rxjs";
import { clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";

const keyDown$ = fromEvent(document, "keydown");

// 1 - calcul du prochain move
const movementState$ = keyDown$.pipe(
  map((event) => event.key),
  map(
    (key) =>
      ({
        ArrowUp: { x: 0, y: -player.speed },
        ArrowDown: { x: 0, y: player.speed },
        ArrowLeft: { x: -player.speed, y: 0 },
        ArrowRight: { x: player.speed, y: 0 },
      }[key] || { x: 0, y: 0 })
  ),
  // 3 - on envoie un premier movement dans le flux même si aucune keydown
  startWith({ x: 0, y: 0 })
);

// 2 - Maj de la position du joueur
const playerPos$ = movementState$.pipe(
  scan((position, movement) => {
    const newPosition = {
      x: position.x + movement.x,
      y: position.y + movement.y,
    };
    return newPosition;
  }, player)
);

const render = (playerPos) => {
  clearCanvas();
  drawThePlayer(playerPos);
};

const game$ = isPlayerReady$.pipe(
  filter(Boolean),
  switchMap(() => playerPos$),
  tap((position) => console.log("position", position)),
  tap(render)
);

game$.subscribe();
