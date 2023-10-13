// ETAPE 4 : MANGER DES POMMES (collisions)
// https://youtu.be/2KtmsSrnp6g?si=1p7MiuSAzMjM3hcT

import {
  BehaviorSubject,
  combineLatest,
  filter,
  fromEvent,
  interval,
  map,
  scan,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import {
  calculateNextMove,
  canvasCollision,
  clearCanvas,
  drawFruit,
  drawThePlayer,
  fruitCollision,
  fruitCounterDiv,
  isFruitReady$,
  isPlayerReady$,
  player,
  resetFruit,
} from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
const keyUp$ = fromEvent(document, "keyup");
const tick$ = interval(1000 / 60); // 60 FPS
// 3 - manger des pommes
const fruitCounter$ = new BehaviorSubject(0);

// next movement
const movementState$ = keyDown$.pipe(
  map((event) => event.key),
  map(calculateNextMove),
  // on envoie un premier movement dans le flux même si aucune keydown
  startWith({ x: 0, y: 0 }),
  // on envoie le movement dans le flux à chaque tick
  switchMap((movement) =>
    tick$.pipe(
      // on triche parce que sinon on pert le movement
      map(() => movement),
      // on envoie plus de nouveau movement si keyUp
      takeUntil(keyUp$)
    )
  )
);

// 4 - on renomme car en fait on va pas que s'occuper de la position du player
// Update game state
const update$ = movementState$.pipe(
  scan((position, movement) => {
    const newPosition = {
      x: position.x + movement.x,
      y: position.y + movement.y,
    };

    // 3 - Manger des pommes
    if (fruitCollision(newPosition)) {
      fruitCounter$.next(fruitCounter$.value + 1);
      resetFruit();
    }

    // 4 - on ajoute la canvasCollision
    return canvasCollision(newPosition) ? position : newPosition;
  }, player)
);

const render = (playerPos) => {
  clearCanvas();
  // 2 - Ajout du drawFruit()
  drawFruit();
  drawThePlayer(playerPos);
};

// 1 - On ajoute un combineLatest pour le fruit
const game$ = combineLatest([isPlayerReady$, isFruitReady$]).pipe(
  filter((imagesReady) => imagesReady.every(Boolean)),
  switchMap(() => update$),
  tap((position) => console.log("position", position)),
  tap(render)
);
game$.subscribe();

fruitCounter$
  .pipe(
    map((count) => `🍎 : ${count}`),
    tap((text) => (fruitCounterDiv.innerHTML = text))
  )
  .subscribe();
