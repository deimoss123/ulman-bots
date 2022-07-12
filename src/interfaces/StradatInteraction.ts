import { ChanceValue } from '../items/helpers/chance';
import { ItemKey } from '../items/itemList';

type MinLati = number;
type MaxLati = number;

interface StradatResult {
  chance: ChanceValue;
  text: string;
  reward: { lati?: [MinLati, MaxLati]; items?: Record<ItemKey, number> } | null;
}

interface StradatVeids {
  chance: ChanceValue;
  text: string;
  options: {
    label: string;
    customId: string;
    result: Record<string, StradatResult>;
  }[];
}

type StradatInteractions = Record<string, StradatVeids>;

export default StradatInteractions;
