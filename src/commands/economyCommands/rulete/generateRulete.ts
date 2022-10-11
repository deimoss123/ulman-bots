import { RulPosition, rulPositions } from './ruleteData';

export type RulColors = 'red' | 'black' | 'green';

export interface GenerateRuleteRes {
  num: number;
  color: RulColors;
  didWin: boolean;
  multiplier: number;
}

export default function generateRulete(pos: RulPosition | number): GenerateRuleteRes {
  const num = Math.floor(Math.random() * 37);
  const color: RulColors = num === 0 ? 'green' : rulPositions.red.numbers.includes(num) ? 'red' : 'black';

  let didWin = false;
  let multiplier = 0;

  if (typeof pos === 'number') {
    if (num === pos) {
      didWin = true;
      multiplier = 35;
    }
  } else if (rulPositions[pos].numbers.includes(num)) {
    didWin = true;
    multiplier = 2;
  }

  return { num, color, didWin, multiplier };
}
