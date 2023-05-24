import loto, { LotoOptions } from './loto';

export const latlotoOptions: LotoOptions = {
  rows: 3,
  columns: 3,
  scratches: 3,
  minRewards: 4,
  maxRewards: 5,
  rewards: {
    '25_lati': {
      lati: 25,
      emoji: '<:loto_25:1109595002331463750>',
      chance: '*',
    },
    '60_lati': {
      lati: 60,
      emoji: '<:loto_60:1110909043624644658>',
      chance: 0.25,
    },
    '100_lati': {
      lati: 100,
      emoji: '<:loto_100:1109594522989633616>',
      chance: 0.18,
    },
    '250_lati': {
      lati: 250,
      emoji: '<:loto_250:1110909044987793528>',
      chance: 0.1,
    },
    '450_lati': {
      lati: 450,
      emoji: '<:loto_450:1110944184107532369>',
      chance: 0.01,
    },
    '2x': {
      multiplier: 2,
      emoji: '<:loto_reiz_2x:1110916839351005255>',
      chance: 0.2,
    },
    '3x': {
      multiplier: 3,
      emoji: '<:loto_reiz_3x:1110920161122340875>',
      chance: 0.1,
    },
    '5x': {
      multiplier: 5,
      emoji: '<:loto_reiz_5x:1110919183564288040>',
      chance: 0.02,
    },
  },
  colors: [
    { lati: 1000, color: 0xf066ff },
    { lati: 500, color: 0x66ffc2 },
    { lati: 200, color: 0x96ff66 },
    { lati: 100, color: 0xe0ff66 },
    { lati: 60, color: 0xffd166 },
    { lati: 25, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

export default loto('latloto', latlotoOptions);
