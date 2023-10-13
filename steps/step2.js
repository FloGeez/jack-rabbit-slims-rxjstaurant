// Etape 2 : Movement
/**
 * Info/Tips:
 * - fromEvent pour écouter le clavier "keydown"
 * -
 */

// import { filter, fromEvent, map, scan, startWith, switchMap, tap } from "rxjs";
// import { clearCanvas, drawThePlayer, isPlayerReady$, player } from "../game.util";

import { filter, of, tap } from "rxjs";
import { clearCanvas, drawThePlayer, isPlayerReady$ } from "../game.util";

// TODO 1 - calcul du prochain move
// de keydown vers position {x, y} (exemple : ArrowRight vers { x: player.speed, y: 0 })
// on renvoie un observable movementState$ avec une position de mouvement {x, y}
// si besoin la fonction 'calculateNextMove' de game.util peut-être utilisé
const movementState$ = of({ x: 0, y: 0 });

// TODO 2 - Maj de la position du joueur
// On part du movement pour calculer la nouvelle position du joueur
// Utiliser l'operateur scan : (c'est comme un reduce)
const playerPos$ = movementState$.pipe();

const render = () => {
  clearCanvas();
  drawThePlayer();
};

// 3 - utilisation de playerPos$ ici
const game$ = isPlayerReady$.pipe(filter(Boolean), tap(console.log), tap(render));

game$.subscribe();
