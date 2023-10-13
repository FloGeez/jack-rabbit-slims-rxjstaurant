// ETAPE 7 - OVERCOOKED
// https://youtu.be/khmp0o8pXMM?t=119

import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  fromEvent,
  interval,
  map,
  scan,
  skipWhile,
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
  drawTheKitchenCounter,
  drawThePlayer,
  drawThePot,
  fruitCollision,
  fruitCounterDiv,
  isFruitReady$,
  isMixerReady$,
  isPlayerReady$,
  kitchenCounterCollision,
  player,
  potCollision,
  renderGameOver,
  resetFruit,
  scoreDiv,
} from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
const keyUp$ = fromEvent(document, "keyup");
const tick$ = interval(1000 / 60); // 60 FPS
const fruitCounter$ = new BehaviorSubject(0);

const potCollision$ = new BehaviorSubject(false);
const kitchenCounterCollision$ = new BehaviorSubject(false);
const isCooking$ = new BehaviorSubject(false);
const isCooked$ = new BehaviorSubject(false);
const score$ = new BehaviorSubject(0);

const imagesReady$ = combineLatest([isPlayerReady$, isFruitReady$, isMixerReady$]).pipe(
  map((values) => values.every(Boolean)),
  tap(console.log)
);

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

// Update game state
const update$ = movementState$.pipe(
  scan((position, movement) => {
    const newPosition = {
      x: position.x + movement.x,
      y: position.y + movement.y,
    };

    if (fruitCollision(newPosition) && fruitCounter$.value < 3) {
      fruitCounter$.next(fruitCounter$.value + 1);
      resetFruit();
    }

    // Check for collision with the pot
    potCollision$.next(potCollision(newPosition));

    const playerHasToStop = canvasCollision(newPosition) || potCollision$.value;

    // Check for collision with the kitchenCounter
    kitchenCounterCollision$.next(kitchenCounterCollision(newPosition));

    return playerHasToStop ? position : newPosition;
  }, player)
);

potCollision$
  .pipe(
    filter(Boolean),
    withLatestFrom(fruitCounter$),
    filter(([_, fruitCounter]) => fruitCounter >= 3),
    tap(() => isCooking$.next(true))
  )
  .subscribe();

isCooking$
  .pipe(
    debounceTime(1000),
    filter(Boolean),
    tap(console.log),
    tap(() => fruitCounter$.next(0)),
    tap(() => isCooking$.next(false)),
    tap(() => isCooked$.next(true))
  )
  .subscribe();

combineLatest([isCooked$, kitchenCounterCollision$])
  .pipe(
    filter((values) => values.every(Boolean)),
    tap(() => isCooked$.next(false)),
    tap(() => score$.next(score$.value + 1))
  )
  .subscribe();

const gameDurationInSecond = 30;
const calculateAndDisplayCountdown = () => (source$) =>
  source$.pipe(
    map((count) => gameDurationInSecond - count),
    tap((countdown) => (countdownDiv.innerHTML = `time : ${countdown}`))
  );
const countdownTimer$ = timer(0, 1000).pipe(calculateAndDisplayCountdown());

const render = (playerPos) => {
  clearCanvas();
  drawFruit();

  let kitchenCounterColor = "gray";
  let potColor = "gray";

  if (fruitCounter$.value >= 3) {
    potColor = "blue";
  }
  if (isCooking$.value) {
    potColor = "green";
  } else if (isCooked$.value) {
    potColor = "gray";
    kitchenCounterColor = "blue";
  }
  drawTheKitchenCounter(kitchenCounterColor);
  drawThePot(potColor);
  drawThePlayer(playerPos);
};

// slideAnimationGameOver
const isGameOver$ = new BehaviorSubject(false);

const slideAnimationGameOver$ = isGameOver$.pipe(
  tap(console.log),
  skipWhile((isGameOver) => !isGameOver),
  switchMap(() => tick$),
  scan(
    (position) => {
      position.y += 3; // speed
      return position;
    },
    { y: -100 }
  ),
  tap(renderGameOver),
  takeWhile((position) => position.y < canvas.height / 2 - 50)
);
slideAnimationGameOver$.subscribe();

const game$ = imagesReady$.pipe(
  // On switch plutôt sur le tick$ afin de mettre constament à jour le canvas
  switchMap(() => tick$),
  withLatestFrom(update$),
  map(([_, playerPos]) => playerPos),
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

score$
  .pipe(
    map((count) => `score : ${count}`),
    tap((text) => (scoreDiv.innerHTML = text))
  )
  .subscribe();
