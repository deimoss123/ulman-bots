import { ChanceValue } from '../../../items/helpers/chance';

interface Laimests {
  chance: ChanceValue;
  multiplier: number;
  emoji: string;
  variations: number[];
}

const feniksLaimesti: Record<string, Laimests> = {
  varde: {
    chance: '*',
    multiplier: 0.01,
    emoji: '<:varde:894250302868443169>',
    variations: [1, 3, 5],
  },
  zivs: {
    chance: 0.2,
    multiplier: 0.05,
    emoji: '<:zivs:894250303094947900>',
    variations: [3, 5],
  },
  nuja: {
    chance: 0.15,
    multiplier: 0.1,
    emoji: '<:nuja:894250302633553931>',
    variations: [2, 3],
  },
  muskulis: {
    chance: 0.1,
    multiplier: 0.2,
    emoji: '<:muskulis:894250303371763762>',
    variations: [2, 3],
  },
  bacha: {
    chance: 0.07,
    multiplier: 0.5,
    emoji: '<:bacha:894250303183020074>',
    variations: [3],
  },
  izbrinits: {
    chance: 0.03,
    multiplier: 1,
    emoji: '<:izbrinits:894250302914592788>',
    variations: [3],
  },
  kabacis: {
    chance: 0.01,
    multiplier: 3,
    emoji: '<:kabacis:894250303191388230>',
    variations: [1, 2, 3],
  },
  ulmanis: {
    chance: 0.007,
    multiplier: 5,
    emoji: '<:ulmanis:894250302839066624>',
    variations: [1, 2, 3],
  },
  petnieks: {
    chance: 0.002,
    multiplier: 10,
    emoji: '<a:petnieks:911599720928002059>',
    variations: [1, 2, 3],
  },
};

export default feniksLaimesti;
