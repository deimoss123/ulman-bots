import { ChanceValue } from '../../../items/helpers/chance';
import { ItemKey } from '../../../items/itemList';

type FishChance = Record<
  ItemKey,
  {
    chance: ChanceValue;
    cost: number;
  }
>;

const maksekeresData: Record<
  ItemKey,
  {
    maxDurability: number;
    timeMinHours: number;
    timeMaxHours: number;
    fishChances: FishChance;
  }
> = {
  koka_makskere: {
    maxDurability: 15,
    timeMinHours: 3.5,
    timeMaxHours: 4.0,
    fishChances: {
      lidaka: { chance: '*', cost: 1 },
      asaris: { chance: '*', cost: 1 },
      lasis: { chance: '*', cost: 1 },
    },
  },
  divaina_makskere: {
    maxDurability: 80,
    timeMinHours: 2.5,
    timeMaxHours: 3.0,
    fishChances: {
      lidaka: { chance: '*', cost: 1 },
      asaris: { chance: '*', cost: 1 },
      lasis: { chance: '*', cost: 1 },
    },
  },
};

export default maksekeresData;
