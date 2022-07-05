import { ItemKey } from '../items/itemList';

export interface LevelReward {
  lati?: number;
  item?: Record<ItemKey, number>;
}

export interface LevelMilestone {
  xp: number;
  reward: LevelReward;
}

/*
ubagošana - 1-2
stradašana - 4-6
 */

// lati ko saņem par katru lieko xp ja ir sasniegts max līmenis
export const MAX_LEVEL_REWARD_PER_XP = 3;

const levelsList: Record<number, LevelMilestone> = {
  1: {
    xp: 15,
    reward: { item: { virve: 1 } },
  },
  2: {
    xp: 30,
    reward: { lati: 20 },
  },
  3: {
    xp: 30,
    reward: { lati: 30 },
  },
  4: {
    xp: 30,
    reward: { lati: 50 },
  },
  5: {
    xp: 30,
    reward: { item: { koka_makskere: 1 } },
  },
  6: {
    xp: 50,
    reward: { lati: 80 },
  },
  7: {
    xp: 50,
    reward: { lati: 100 },
  },
  8: {
    xp: 50,
    reward: { item: { latloto: 1 } },
  },
  9: {
    xp: 50,
    reward: { lati: 125 },
  },
  10: {
    xp: 50,
    reward: { item: { dizloto: 1 } },
  },
};

export const MAX_LEVEL = Object.keys(levelsList).length;

export default levelsList;
