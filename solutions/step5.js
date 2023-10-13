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

    if (fruitCollision(newPosition)) {
      fruitCounter$.next(fruitCounter$.value + 1);
      resetFruit();
    }

    return canvasCollision(newPosition) ? position : newPosition;
  }, player)
);

// 1 - calcule et affichage du COUNTDOWN
const gameDurationInSecond = 10;
// exemple custom operator avec source
const calculateAndDisplayCountdown = () => (source$) =>
  source$.pipe(
    map((count) => gameDurationInSecond - count),
    tap((countdown) => (countdownDiv.innerHTML = `time : ${countdown}`))
  );
//
const calculateCountdown = () => map((count) => gameDurationInSecond - count);
const displayCountdown = () => tap((countdown) => (countdownDiv.innerHTML = `time : ${countdown}`));

// timer pas interval pour pouvoir démarrer tout de suite (les laissez faire avec interval d'abord)
const countdownTimer$ = timer(0, 1000).pipe(
  // Je montre : faire ce premier truc en custom operator
  calculateCountdown(),
  // à eux de faire le deuxième
  displayCountdown()
);
// 2 - on oublie pas le subscribe mais on l'enlève après
// countdownTimer$.subscribe();

const render = (playerPos) => {
  clearCanvas();
  drawFruit();
  drawThePlayer(playerPos);
};

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
  finalize(renderGameOver)
);
game$.subscribe();

fruitCounter$
  .pipe(
    map((count) => `🍎 : ${count}`),
    tap((text) => (fruitCounterDiv.innerHTML = text))
  )
  .subscribe();
