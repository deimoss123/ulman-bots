import loto, { LotoOptions } from './loto';

export const nabagLotoOptions: LotoOptions = {
  rows: 2,
  columns: 3,
  scratches: 2,
  minRewards: 3,
  maxRewards: 3,
  rewards: {
    '10_lati': {
      lati: 10,
      emoji: '<:loto_10:1110909039367442454>',
      chance: '*',
    },
    '15_lati': {
      lati: 15,
      emoji: '<:loto_15:1110909040927723561>',
      chance: 0.35,
    },
    '25_lati': {
      lati: 25,
      emoji: '<:loto_25:1109595002331463750>',
      chance: 0.25,
    },
    '100_lati': {
      lati: 100,
      emoji: '<:loto_100:1109594522989633616>',
      chance: 0.1,
    },
    '2x': {
      multiplier: 2,
      emoji: '<:loto_reiz_2x:1110916839351005255>',
      chance: 0.25,
    },
  },
  colors: [
    { lati: 200, color: 0xf066ff },
    { lati: 100, color: 0x66ffc2 },
    { lati: 80, color: 0x96ff66 },
    { lati: 40, color: 0xe0ff66 },
    { lati: 20, color: 0xffd166 },
    { lati: 10, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

export default loto('nabagloto', nabagLotoOptions);
