// Etape 1 : Render when ready

import { filter, tap } from "rxjs";
import { clearCanvas, drawThePlayer, isPlayerReady$ } from "../game.util";

const render = () => {
  clearCanvas();
  drawThePlayer();
};

const game$ = isPlayerReady$.pipe(filter(Boolean), tap(console.log), tap(render));

game$.subscribe();
