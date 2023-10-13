import { filter, from, fromEvent, map, switchMap, tap } from "rxjs";

const fruitAndVegetableBoxes = [
  { fruit: "🍎", vegetable: "🍆" },
  { fruit: "🍌", vegetable: "🍄" },
  { fruit: "🥝", vegetable: "🥦" },
  { fruit: "🍊", vegetable: "🍆" },
  { fruit: "🍊", vegetable: "🍄" },
  { fruit: "🍎", vegetable: "🥕" },
  { fruit: "🍌", vegetable: "🥒" },
  { fruit: "🥝", vegetable: "🍆" },
];

const fruitsAndVegetableBoxes$ = from(fruitAndVegetableBoxes);

const click$ = fromEvent(document, "click");
const obs$ = click$.pipe(
  tap(() => console.log("click")),
  switchMap(() => fruitsAndVegetableBoxes$),
  tap(console.log),
  map((fruitAndVegetable) => fruitAndVegetable.fruit),
  tap(console.log),
  filter((fruit) => fruit === "🍎"),
  tap(console.log)
);

obs$.subscribe();
