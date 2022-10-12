import { ItemKey } from '../items/itemList';

export interface TaxDiscount {
  payTax?: number;
  giveTax?: number;
}

export interface LevelReward {
  lati?: number;
  item?: Record<ItemKey, number>;
  taxDiscount?: TaxDiscount;
  fishingInvIncrease?: number;
}

export interface LevelMilestone {
  xp: number;
  reward: LevelReward;
  message?: string;
}

/*
ubagošana - 1-2
stradašana - 4-6
 */

// lati ko saņem par katru lieko xp ja ir sasniegts max līmenis
export const MAX_LEVEL_REWARD_PER_XP = 5;

const levelsList: Record<number, LevelMilestone> = {
  1: {
    xp: 20,
    reward: { item: { brivgriez10: 5 } },
  },
  2: {
    xp: 30,
    reward: { lati: 60 },
  },
  3: {
    xp: 30,
    reward: { item: { virve: 7 } },
  },
  4: {
    xp: 30,
    reward: { lati: 90 },
  },
  5: {
    xp: 30,
    reward: {
      item: { koka_makskere: 1 },
      taxDiscount: { giveTax: 0.14 },
      fishingInvIncrease: 8,
    },
  },
  6: {
    xp: 50,
    reward: { lati: 120 },
  },
  7: {
    xp: 50,
    reward: { lati: 140 },
  },
  8: {
    xp: 50,
    reward: { item: { latloto: 2 } },
  },
  9: {
    xp: 50,
    reward: { lati: 170 },
  },
  10: {
    xp: 50,
    reward: {
      item: {
        kafijas_aparats: 1,
      },
      taxDiscount: {
        giveTax: 0.13,
        payTax: 0.09,
      },
      fishingInvIncrease: 10,
    },
  },
  11: {
    xp: 75,
    reward: { lati: 200 },
  },
  12: {
    xp: 75,
    reward: { item: { brivgriez50: 3 } },
  },
  13: {
    xp: 75,
    reward: { lati: 240 },
  },
  14: {
    xp: 75,
    reward: { item: { nazis: 1, zemenu_rasens: 1 } },
  },
  15: {
    xp: 75,
    reward: {
      item: { dizloto: 1 },
      taxDiscount: { giveTax: 0.12 },
      fishingInvIncrease: 12,
    },
  },
  16: {
    xp: 100,
    reward: { lati: 300 },
  },
  17: {
    xp: 100,
    reward: { item: { zemenu_rasens: 1, nazis: 2 } },
  },
  18: {
    xp: 100,
    reward: { lati: 325 },
  },
  19: {
    xp: 100,
    reward: { lati: 350 },
  },
  20: {
    xp: 100,
    reward: {
      item: { brivgriez100: 1, petnieks: 1 },
      taxDiscount: {
        payTax: 0.08,
      },
      fishingInvIncrease: 14,
    },
  },
  21: {
    xp: 150,
    reward: { lati: 400 },
  },
  22: {
    xp: 150,
    reward: { lati: 450 },
  },
  23: {
    xp: 150,
    reward: { item: { brivgriez10: 5, brivgriez25: 4, brivgriez50: 3, latloto: 2 } },
  },
  24: {
    xp: 150,
    reward: { lati: 500 },
  },
  25: {
    xp: 150,
    reward: {
      taxDiscount: {
        payTax: 0.07,
        giveTax: 0.11,
      },
      fishingInvIncrease: 16,
    },
  },
  26: {
    xp: 200,
    reward: { lati: 600 },
  },
  27: {
    xp: 200,
    reward: {},
  },
  28: {
    xp: 200,
    reward: {},
  },
  29: {
    xp: 200,
    reward: {},
  },
  30: {
    xp: 200,
    reward: {
      taxDiscount: {
        payTax: 0.06,
        giveTax: 0.1,
      },
      fishingInvIncrease: 18,
    },
  },
  31: {
    xp: 300,
    reward: {},
  },
  32: {
    xp: 300,
    reward: {},
  },
  33: {
    xp: 300,
    reward: {},
  },
  34: {
    xp: 300,
    reward: {},
  },
  35: {
    xp: 300,
    reward: {
      taxDiscount: {
        payTax: 0.04,
        giveTax: 0.08,
      },
      fishingInvIncrease: 20,
    },
  },
  36: {
    xp: 400,
    reward: {},
  },
  37: {
    xp: 400,
    reward: {},
  },
  38: {
    xp: 400,
    reward: {},
  },
  39: {
    xp: 400,
    reward: {},
  },
  40: {
    xp: 500,
    reward: {
      lati: 10000,
      item: {}, // kkas īpašs
      taxDiscount: {
        payTax: 0.02,
        giveTax: 0.04,
      },
    },
  },
};

export const MAX_LEVEL = Object.keys(levelsList).length;

export default levelsList;
