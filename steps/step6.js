// ETAPE 6 - GAME OVER SLIDE ANIMATION
// https://youtu.be/97Nis75DAgc?t=17

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
  canvas,
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

const gameDurationInSecond = 3;
const calculateAndDisplayCountdown = () => (source$) =>
  source$.pipe(
    map((count) => gameDurationInSecond - count),
    tap((countdown) => (countdownDiv.innerHTML = `time : ${countdown}`))
  );
const countdownTimer$ = timer(0, 1000).pipe(calculateAndDisplayCountdown());

const render = (playerPos) => {
  clearCanvas();
  drawFruit();
  drawThePlayer(playerPos);
};

// TODO : slideAnimationGameOver
const isGameOver$ = new BehaviorSubject(false);

const slideAnimationGameOver$ = isGameOver$.pipe(
  // TODO: Faire ensorte que le GAME OVER slide du haut vers le bas
  filter(Boolean),
  tap(() => renderGameOver())
  // takeWhile((position) => position.y < canvas.height / 2 - 50)
);
slideAnimationGameOver$.subscribe();

const game$ = combineLatest([isPlayerReady$, isFruitReady$]).pipe(
  filter((imagesReady) => imagesReady.every(Boolean)),
  // On switch plutôt sur le tick$ afin de mettre constament à jour le canvas
  switchMap(() => tick$),
  withLatestFrom(update$),
  map(([_, playerPos]) => playerPos),
  tap((playerPos) => console.log("position", playerPos)),
  tap(render),
  // on récupère le countdown
  withLatestFrom(countdownTimer$),
  map(([_, countdownTimer]) => countdownTimer),
  // on prend le flux jusqu'à 0
  takeWhile((countdownTimer) => countdownTimer > 0),
  finalize(() => isGameOver$.next(true))
);
game$.subscribe();

fruitCounter$
  .pipe(
    map((count) => `🍎 : ${count}`),
    tap((text) => (fruitCounterDiv.innerHTML = text))
  )
  .subscribe();
