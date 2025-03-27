import emoji from '@/utils/emoji';
import loto, { LotoOptions } from '@/items/usableItems/loto';

export const dizlotoOptions: LotoOptions = {
  rows: 3,
  columns: 4,
  scratches: 4,
  minRewards: 6,
  maxRewards: 6,
  rewards: {
    '60_lati': {
      lati: 60,
      emoji: () => emoji('loto_60'),
      chance: '*',
    },
    '100_lati': {
      lati: 100,
      emoji: () => emoji('loto_100'),
      chance: 0.22,
    },
    '250_lati': {
      lati: 250,
      emoji: () => emoji('loto_250'),
      chance: 0.1,
    },
    '450_lati': {
      lati: 450,
      emoji: () => emoji('loto_450'),
      chance: 0.05,
    },
    '800_lati': {
      lati: 800,
      emoji: () => emoji('loto_800'),
      chance: 0.01,
    },
    '2x': {
      multiplier: 2,
      emoji: () => emoji('loto_reiz_2x'),
      chance: 0.2,
    },
    '3x': {
      multiplier: 3,
      emoji: () => emoji('loto_reiz_3x'),
      chance: 0.1,
    },
    '5x': {
      multiplier: 5,
      emoji: () => emoji('loto_reiz_5x'),
      chance: 0.02,
    },
  },
  colors: [
    { lati: 1500, color: 0xf066ff },
    { lati: 1000, color: 0x66ffc2 },
    { lati: 500, color: 0x96ff66 },
    { lati: 250, color: 0xe0ff66 },
    { lati: 100, color: 0xffd166 },
    { lati: 60, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

export default loto('dizloto', dizlotoOptions);
