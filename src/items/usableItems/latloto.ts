import iconEmojis from '../../embeds/iconEmojis';
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
      emoji: iconEmojis.checkmark,
      chance: '*',
    },
    '100_lati': {
      lati: 100,
      emoji: iconEmojis.checkmark,
      chance: 0.2,
    },
    '250_lati': {
      lati: 250,
      emoji: iconEmojis.checkmark,
      chance: 0.2,
    },
    '2x': {
      multiplier: 2,
      emoji: iconEmojis.blueArrowRight,
      chance: 0.2,
    },
  },
};

export default loto('latloto', latlotoOptions);
