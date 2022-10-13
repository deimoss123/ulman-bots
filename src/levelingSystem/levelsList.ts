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
    reward: { item: { brivgriez25: 3 } },
  },
  2: {
    xp: 30,
    reward: { lati: 70, item: { kafija: 1 } },
  },
  3: {
    xp: 30,
    reward: { item: { virve: 7, metalluznis: 3 } },
  },
  4: {
    xp: 30,
    reward: { lati: 90, item: { kafija: 1 } },
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
    reward: { lati: 120, item: { smilsu_pulkstenis: 1 } },
  },
  7: {
    xp: 50,
    reward: { lati: 140, item: { metalluznis: 3 } },
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
    reward: { item: { brivgriez25: 2, brivgriez50: 3 } },
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
    reward: { item: { zemenu_rasens: 1, nazis: 1 } },
  },
  18: {
    xp: 100,
    reward: { lati: 325 },
  },
  19: {
    xp: 100,
    reward: { lati: 350, item: { kafija: 2, metalluznis: 3 } },
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
    reward: { lati: 400, item: { smilsu_pulkstenis: 1 } },
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
      item: { smilsu_pulkstenis: 2 },
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
    reward: { item: { divaina_zivs: 1, juridiska_zivs: 1 } },
  },
  28: {
    xp: 200,
    reward: { lati: 700 },
  },
  29: {
    xp: 200,
    reward: { lati: 700, item: { loto_makskere: 1 } },
  },
  30: {
    xp: 200,
    reward: {
      item: { dizmakskere: 1 },
      taxDiscount: {
        payTax: 0.06,
        giveTax: 0.1,
      },
      fishingInvIncrease: 18,
    },
  },
  31: {
    xp: 300,
    reward: { lati: 1000, item: { kafijas_aparats: 1 } },
  },
  32: {
    xp: 300,
    reward: { lati: 1200, item: { petnieks: 1 } },
  },
  33: {
    xp: 300,
    reward: { lati: 1200, item: { dizmakskere: 1 } },
  },
  34: {
    xp: 300,
    reward: { lati: 1600 },
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
    reward: { lati: 2000, item: { naudas_maiss: 1 } },
  },
  37: {
    xp: 400,
    reward: { lati: 2000, item: { naudas_maiss: 2 } },
  },
  38: {
    xp: 400,
    reward: { lati: 3000, item: { kafijas_aparats: 1 } },
  },
  39: {
    xp: 400,
    reward: { lati: 4000 },
  },
  40: {
    xp: 500,
    reward: {
      lati: 5000,
      item: { divainais_burkans: 1 },
      taxDiscount: {
        payTax: 0.02,
        giveTax: 0.04,
      },
    },
  },
};

export const MAX_LEVEL = Object.keys(levelsList).length;

export default levelsList;
