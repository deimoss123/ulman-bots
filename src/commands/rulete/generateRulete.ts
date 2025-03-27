import { RulColors, ruleteOrder, RulPosition, rulPositions } from './ruleteData';

export interface GenerateRuleteRes {
  num: number;
  color: RulColors;
  didWin: boolean;
  multiplier: number;
}

// blakus skaitlis skaitīšanas sistēmā (ja pozīcija uz 5, tad 4 vai 6)
// pretējā gadījumā, blakus skaitlis ratā
function getRandomNeighborNum(pos: number): number {
  const numericNeighbor = Math.random() < 0.5;

  if (numericNeighbor) {
    if (pos === 0) return 1;
    if (pos === 36) return 35;
    return pos + (Math.random() < 0.5 ? 1 : -1);
  }

  const numbers = ruleteOrder.map(([num]) => num);
  const idx = numbers.indexOf(pos);
  if (idx === -1) return pos;

  const leftIdx = idx - 1 < 0 ? numbers.length - 1 : idx - 1;
  const rightIdx = idx + 1 >= numbers.length ? 0 : idx + 1;

  return numbers[Math.random() < 0.5 ? leftIdx : rightIdx];
}

export default function generateRulete(pos: RulPosition | number): GenerateRuleteRes {
  const randNum = Math.random();

  let num = Math.floor(Math.random() * 37);

  let didWin = false;
  let multiplier = 0;

  if (typeof pos === 'number') {
    if (num === pos) {
      didWin = true;
      multiplier = 35;
    } else if (randNum < 0.3) {
      num = getRandomNeighborNum(pos);
    }
  } else {
    if (rulPositions[pos].isMatching(num)) {
      didWin = true;
      multiplier = 2;
    } else if (pos === 'low' && randNum < 0.2) {
      num = Math.random() < 0.5 ? 0 : 19;
    } else if (pos === 'high' && randNum < 0.1) {
      num = 18;
    }
  }

  return {
    num,
    color: ruleteOrder.find(([n]) => n === num)![1],
    didWin,
    multiplier,
  };
}
