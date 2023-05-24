import loto, { LotoOptions } from './loto';

export const ulmanlotoOptions: LotoOptions = {
  rows: 4,
  columns: 5,
  scratches: 6,
  minRewards: 11,
  maxRewards: 11,
  rewards: {
    '100_lati': {
      lati: 100,
      emoji: '<:loto_100_2:1109594522989633616>',
      chance: '*',
    },
    '250_lati': {
      lati: 250,
      emoji: '<:loto_250:1110909044987793528>',
      chance: 0.25,
    },
    '450_lati': {
      lati: 450,
      emoji: '<:loto_450:1110944184107532369>',
      chance: 0.15,
    },
    '800_lati': {
      lati: 800,
      emoji: '<:loto_800:1110944186884169728>',
      chance: 0.08,
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
    { lati: 4000, color: 0xf066ff },
    { lati: 2000, color: 0x66ffc2 },
    { lati: 1000, color: 0x96ff66 },
    { lati: 400, color: 0xe0ff66 },
    { lati: 200, color: 0xffd166 },
    { lati: 100, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

export default loto('ulmanloto', ulmanlotoOptions);
