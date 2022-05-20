import { ChanceRecord } from '../../items/helpers/chance';

const laimestiDizloto: ChanceRecord = {
  win_massive: {
    chance: 0.01,
    reward: 4000,
    name: '**!!! MILZĪGO !!!**',
    color: '#eb44ff',
  },
  win_big: {
    chance: 0.1,
    reward: 800,
    name: '**! LIELO !**',
    color: '#45e8e8',
  },
  win_medium: {
    chance: 0.2,
    reward: 400,
    name: '**vidējo**',
    color: '#69ee54',
  },
  win_small: {
    chance: 0.45,
    reward: 170,
    name: 'mazo',
    color: '#f6d179',
  },
  lose: {
    chance: '*',
    reward: 0,
    color: '#565656',
  },
};

export default laimestiDizloto;