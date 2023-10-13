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

// TODO 1 - Afficher les boites de fruit / légume dans la console
// TODO 2 - Afficher que les fruits
// TODO 3 - Afficher que les pommes
// TODO 4 - Lancer l'affichage qu'au 'click'

const obs$ = fruitsAndVegetableBoxes$.pipe();

obs$.subscribe();
