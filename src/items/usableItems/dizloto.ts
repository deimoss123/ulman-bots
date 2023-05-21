import loto, { LotoOptions } from './loto';

const dizlotoOptions: LotoOptions = {
  rows: 3,
  columns: 4,
  scratches: 4,
  minRewards: 6,
  maxRewards: 7,
  rewards: {
    '25_lati': {
      lati: 25,
      emoji: '<:loto_25:1109595002331463750>',
      chance: '*',
    },
    '60_lati': {
      lati: 60,
      // TODO
      emoji: '<:loto_50:1109595004151812197>',
      chance: 0.23,
    },
    '100_lati': {
      lati: 100,
      emoji: '<:loto_100_2:1109594522989633616>',
      chance: 0.17,
    },
    '250_lati': {
      lati: 250,
      // TODO
      emoji: '<:loto_100_2:1109594522989633616>',
      chance: 0.05,
    },
    '2x': {
      multiplier: 2,
      emoji: '<:loto_2x:1107689016595329115>',
      chance: 0.18,
    },
    '3x': {
      multiplier: 3,
      // TODO
      emoji: '<:loto_2x:1107689016595329115>',
      chance: 0.07,
    },
    '5x': {
      multiplier: 5,
      // TODO
      emoji: '<:loto_2x:1107689016595329115>',
      chance: 0.005,
    },
  },
};

export default loto('dizloto', dizlotoOptions);
