import chance from '../../../items/helpers/chance';
import feniksLaimesti from './feniksLaimesti';

export interface CalcSpinRes {
  emojiGroups: {
    name: string;
    count: number;
    isWinner: boolean;
  }[];
  totalMultiplier: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function calcSpin(emojiCount: number): CalcSpinRes {
  const res: Record<string, number> = {};
  let emojiGroups: CalcSpinRes['emojiGroups'] = [];
  let totalMultiplier = 0;

  for (let i = 0; i < emojiCount; i++) {
    const { key } = chance(feniksLaimesti);
    res[key] = res[key] ? res[key] + 1 : 1;
  }

  for (const [name, count] of Object.entries(res)) {
    const { multipliers } = feniksLaimesti[name];
    if (multipliers?.[count]) {
      totalMultiplier += multipliers[count];
      emojiGroups.push({ name, count, isWinner: true });
    } else {
      emojiGroups.push(...Array(count).fill({ name, count: 1, isWinner: false }));
    }
  }

  emojiGroups = shuffleArray(emojiGroups);
  totalMultiplier = Math.floor(totalMultiplier * 100) / 100;

  // console.log('-'.repeat(50));
  // console.log('res', res);
  // console.log('total multiplier', totalMultiplier);
  // console.log('emojiGroups', emojiGroups);
  // console.log('-'.repeat(50));

  return {
    emojiGroups,
    totalMultiplier,
  };
}

export function testSpins(count: number) {
  console.log('Testē griezienus...');

  let totalMultiplierSum = 0;
  for (let i = 0; i < count; i++) {
    totalMultiplierSum += calcSpin(5).totalMultiplier;
  }

  console.log(`Skaits: ${count}, vidējais reizinātajs - ${totalMultiplierSum / count}`);
}
