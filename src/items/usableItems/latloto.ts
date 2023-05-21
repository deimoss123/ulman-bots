import loto, { LotoOptions } from './loto';

const latlotoOptions: LotoOptions = {
  rows: 3,
  columns: 3,
  scratches: 4,
  minRewards: 3,
  maxRewards: 5,
  rewards: {
    '25_lati': {
      lati: 25,
      emoji: '<:loto_25:1109595002331463750>',
      chance: '*',
    },
    '50_lati': {
      lati: 50,
      emoji: '<:loto_50:1109595004151812197>',
      chance: 0.2,
    },
    '100_lati': {
      lati: 100,
      emoji: '<:loto_100_2:1109594522989633616>',
      chance: 0.2,
    },
    '2x': {
      multiplier: 2,
      emoji: '<:loto_2x:1107689016595329115>',
      chance: 0.2,
    },
  },
};

export default loto('latloto', latlotoOptions);
