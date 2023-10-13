// Etape 3 : Handle movement smoothly : tick (or gameLoop)

import { filter, fromEvent, interval, map, scan, startWith, switchMap, takeUntil, tap } from "rxjs";
import { calculateNextMove, clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
const keyUp$ = fromEvent(document, "keyup");
const tick$ = interval(1000 / 60); // 60 FPS

const movementState$ = keyDown$.pipe(
  map((event) => event.key),
  map(calculateNextMove),
  // on envoie un premier movement dans le flux même si aucune keydown
  startWith({ x: 0, y: 0 }),
  // 1 - on switch sur un flux 'tick' et on envoie le movement dans ce flux
  switchMap((movement) =>
    tick$.pipe(
      // on triche parce que sinon on pert le movement
      map(() => movement),
      // 2 - on envoie plus de nouveau movement si keyUp
      takeUntil(keyUp$)
    )
  )
);

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
