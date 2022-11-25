import { ChanceValue } from '../../../items/helpers/chance';
import { ItemKey } from '../../../items/itemList';

export type FishChance = Record<
  ItemKey,
  {
    chance: ChanceValue;
    cost: number;
  }
>;

export async function calculateMakskeresData() {
  const itemList = (await import('../../../items/itemList')).default;

  for (const [key, data] of Object.entries(maksekeresData)) {
    const { fishChances, maxDurability, repairable } = data;
    const starChance =
      (1 - Object.values(fishChances).reduce((p, { chance }) => (chance === '*' ? p : p + chance), 0)) /
      Object.values(fishChances).filter(({ chance }) => chance === '*').length;

    const table: { key: string; chance: number; value: number; valPerCost: number }[] = [];
    let avgValuePerCost = 0;

    for (const [fishKey, { chance: ch, cost }] of Object.entries(fishChances)) {
      const value =
        fishKey === 'loto_zivs'
          ? 55
          : fishKey.startsWith('brivgriez')
          ? +fishKey.split('brivgriez')[1]
          : itemList[fishKey].value;
      const chance = ch === '*' ? starChance : ch;
      avgValuePerCost += (value / cost) * chance;

      table.push({ key: fishKey, chance, value, valPerCost: value / cost });
    }
    console.log(`== ${key} ==`);
    console.table(table);

    console.log(`Average value per cost: ${avgValuePerCost.toFixed(2)}`);
    console.log(`Repair per cost: ${repairable ? (itemList[key].value * 2) / maxDurability : '-'}`);
    console.log('\n\n');
  }
  // const avgValuePerCost = ;
  // console.log(`Average value per cost: ${avgValuePerCost}`);
}

const maksekeresData: Record<
  ItemKey,
  {
    maxDurability: number;
    repairable: boolean;
    timeMinHours: number;
    timeMaxHours: number;
    fishChances: FishChance;
  }
> = {
  koka_makskere: {
    maxDurability: 15,
    repairable: true,
    timeMinHours: 3.5,
    timeMaxHours: 4.0,
    fishChances: {
      lidaka: { chance: '*', cost: 1 },
      asaris: { chance: '*', cost: 1 },
      lasis: { chance: '*', cost: 1 },
      metalluznis: { chance: '*', cost: 1 },
      brivgriez25: { chance: '*', cost: 1 },

      brivgriez50: { chance: 0.1, cost: 2 },
      latloto: { chance: 0.1, cost: 2 },
      divaina_zivs: { chance: 0.1, cost: 2 },

      juridiska_zivs: { chance: 0.05, cost: 3 },
      loto_zivs: { chance: 0.03, cost: 3 },
      smilsu_pulkstenis: { chance: 0.01, cost: 3 },
    },
  },
  divaina_makskere: {
    maxDurability: 60,
    repairable: true,
    timeMinHours: 2.5,
    timeMaxHours: 3.0,
    fishChances: {
      lidaka: { chance: '*', cost: 1 },
      asaris: { chance: '*', cost: 1 },
      lasis: { chance: '*', cost: 1 },
      metalluznis: { chance: '*', cost: 1 },
      brivgriez25: { chance: '*', cost: 1 },

      brivgriez50: { chance: 0.08, cost: 2 },
      latloto: { chance: 0.08, cost: 2 },
      divaina_zivs: { chance: 0.08, cost: 2 },

      juridiska_zivs: { chance: 0.08, cost: 3 },
      loto_zivs: { chance: 0.04, cost: 3 },

      kaka_parsaucejs: { chance: 0.03, cost: 2 },

      smilsu_pulkstenis: { chance: 0.03, cost: 3 },
      brivgriez100: { chance: 0.01, cost: 3 },

      kafija: { chance: 0, cost: 1 },
    },
  },
  loto_makskere: {
    maxDurability: 30,
    repairable: true,
    timeMinHours: 3.5,
    timeMaxHours: 4,
    fishChances: {
      brivgriez25: { chance: '*', cost: 1 },
      latloto: { chance: '*', cost: 1 },

      loto_zivs: { chance: 0.2, cost: 2 },
      brivgriez50: { chance: 0.15, cost: 2 },

      dizloto: { chance: 0.1, cost: 3 },

      brivgriez100: { chance: 0.08, cost: 5 },
    },
  },
  luznu_makskere: {
    maxDurability: 7,
    repairable: false,
    timeMinHours: 2,
    timeMaxHours: 2.5,
    fishChances: {
      velo_ramis: { chance: '*', cost: 1 },
      velo_ritenis: { chance: '*', cost: 1 },
      velo_kede: { chance: '*', cost: 1 },
      velo_sture: { chance: '*', cost: 1 },
      metalluznis: { chance: 0.1, cost: 1 },
    },
  },
  dizmakskere: {
    maxDurability: 1,
    repairable: false,
    timeMinHours: 24,
    timeMaxHours: 24,
    fishChances: {
      divaina_mugursoma: { chance: '*', cost: 1 },
      kafijas_aparats: { chance: '*', cost: 1 },
      petnieks: { chance: '*', cost: 1 },
      loto_makskere: { chance: '*', cost: 1 },
      luznu_makskere: { chance: '*', cost: 1 },
      naudas_maiss: { chance: '*', cost: 1 },
      kakis: { chance: '*', cost: 1 },
      divainais_burkans: { chance: 0.05, cost: 1 },
    },
  },
};

export default maksekeresData;
