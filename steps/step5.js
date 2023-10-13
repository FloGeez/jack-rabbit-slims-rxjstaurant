// ETAPE 5 - COUNTDOWN et GAME OVER
// https://youtu.be/2XY3AvVgDns?t=24

import {
  BehaviorSubject,
  combineLatest,
  filter,
  finalize,
  fromEvent,
  interval,
  map,
  scan,
  startWith,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  timer,
  withLatestFrom,
} from "rxjs";
import {
  calculateNextMove,
  canvasCollision,
  clearCanvas,
  countdownDiv,
  drawFruit,
  drawThePlayer,
  fruitCollision,
  fruitCounterDiv,
  isFruitReady$,
  isPlayerReady$,
  player,
  renderGameOver,
  resetFruit,
} from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
const keyUp$ = fromEvent(document, "keyup");
const tick$ = interval(1000 / 60); // 60 FPS
const fruitCounter$ = new BehaviorSubject(0);

// next movement
const movementState$ = keyDown$.pipe(
  map((event) => event.key),
  map(calculateNextMove),
  startWith({ x: 0, y: 0 }),
  switchMap((movement) =>
    tick$.pipe(
      map(() => movement),
      takeUntil(keyUp$)
    )
  )
);

// Update game state
const update$ = movementState$.pipe(
  scan((position, movement) => {
    const newPosition = {
      x: position.x + movement.x,
      y: position.y + movement.y,
    };

    if (fruitCollision(newPosition)) {
      fruitCounter$.next(fruitCounter$.value + 1);
      resetFruit();
    }

    return canvasCollision(newPosition) ? position : newPosition;
  }, player)
);

// TODO 1 - calculer et afficher un COUNTDOWN
// (la partie affichage similaire au compteur de fruit)
const gameDurationInSecond = 10;
// le timer doit être mis à jour toutes les secondes
// TODO 2 - on oublie pas le subscribe (à enlever au TODO 3)
// countdownTimer$.subscribe();

const render = (playerPos) => {
  clearCanvas();
  drawFruit();
  drawThePlayer(playerPos);
};

const game$ = combineLatest([isPlayerReady$, isFruitReady$]).pipe(
  filter((imagesReady) => imagesReady.every(Boolean)),
  // TODO 4 : qq chose à faire ici, si tu es là, appelle moi
  switchMap(() => update$),
  tap((position) => console.log("position", position)),
  tap(render)
  // TODO 3 : on récupère le countdownTimer ici (enlever le subscribe plus haut)
  // on prend le flux jusqu'à 0
  // puis on affiche GAME OVER (renderGameOVer)
);
game$.subscribe();

fruitCounter$
  .pipe(
    map((count) => `🍎 : ${count}`),
    tap((text) => (fruitCounterDiv.innerHTML = text))
  )
  .subscribe();
