import { ChanceRecord } from '../../items/helpers/chance';

const laimestiDizloto: ChanceRecord = {
  win_massive: {
    chance: 0.01,
    reward: 5000,
    name: '**!!! MILZĪGO !!!**',
    color: 0xeb44ff,
  },
  win_big: {
    chance: 0.1,
    reward: 1200,
    name: '**! LIELO !**',
    color: 0x45e8e8,
  },
  win_medium: {
    chance: 0.2,
    reward: 700,
    name: '**vidējo**',
    color: 0x69ee54,
  },
  win_small: {
    chance: 0.45,
    reward: 350,
    name: 'mazo',
    color: 0xf6d179,
  },
  lose: {
    chance: '*',
    reward: 0,
    color: 0x565656,
  },
};

export default laimestiDizloto;
