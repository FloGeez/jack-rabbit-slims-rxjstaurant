// ETAPE 4 : MANGER DES POMMES (collisions)
// https://youtu.be/2KtmsSrnp6g?si=1p7MiuSAzMjM3hcT

import { BehaviorSubject, filter, fromEvent, interval, map, scan, startWith, switchMap, takeUntil, tap } from "rxjs";
import { calculateNextMove, clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";

const keyDown$ = fromEvent(document, "keydown");
const keyUp$ = fromEvent(document, "keyup");
const tick$ = interval(1000 / 60); // 60 FPS
// TODO 3 - manger des pommes
// Utiliser ce BehaviorSubject
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

// On renomme car en fait on va pas que s'occuper de la position du player
const update$ = movementState$.pipe(
  scan((position, movement) => {
    const newPosition = {
      x: position.x + movement.x,
      y: position.y + movement.y,
    };

    // TODO 3 - Manger des pommes
    // Gérer la collision entre le joueur et la pomme
    // Si collision : resetFruit()
    // TODO 4 - Mettre à jour un compteur de fruit

    // TODO 5 - on ajoute la collision avec le canvas
    // Si collision, le joueur ne doit pas bouger
    return newPosition;
  }, player)
);

// TODO 2 - Ajouter l'affichage du fruit (avant le joueur)
const render = (playerPos) => {
  clearCanvas();
  drawThePlayer(playerPos);
};

// TODO 1 - Faire en sorte d'attendre aussi que le fruit est prêt à être affiché (isFruitReady$)
// Uitlisation d'un opérateur de 'combination'
// Modifier le filter en fonction
const game$ = isPlayerReady$.pipe(
  filter(Boolean),
  switchMap(() => update$),
  tap((position) => console.log("position", position)),
  tap(render)
);
game$.subscribe();

// TODO 4 - Afficher le compte des fruits dans le fruitCounterDiv.innerHTML
