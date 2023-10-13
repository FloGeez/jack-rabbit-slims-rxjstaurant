// Etape 3 : Handle movement smoothly : tick (or gameLoop)

// import { filter, fromEvent, interval, map, scan, startWith, switchMap, takeUntil, tap } from "rxjs";
// import { calculateNextMove, clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";
import { filter, fromEvent, map, of, scan, startWith, switchMap, tap } from "rxjs";
import { calculateNextMove, clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
// TODO 1 créer un flux 'tick' qui émet toutes les 1000/60 ms (60fps)
const tick$ = of(true);

// TODO 2 - Envoyer le movement à chaque tick
// TODO 3 - Ecouter les evénements de keyUp pour stoper l'envoi du movement
const movementState$ = keyDown$.pipe(
  map((event) => event.key),
  map(calculateNextMove),
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
