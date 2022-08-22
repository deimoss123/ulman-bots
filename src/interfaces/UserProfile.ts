import { ItemKey } from '../items/itemList';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

export interface ItemAttributes {
  timesUsed?: number;
  durability?: number;
  lastUsed?: string; // unix millis
  customName?: string;
}

export interface SpecialItemInProfile {
  _id?: string; // ObjectId
  name: ItemKey;
  attributes: ItemAttributes;
}

export interface TimeCooldown {
  name: string;
  lastUsed: number;
}

export type DailyCooldowns = Record<
  'stradat' | 'ubagot',
  {
    timesUsed: number;
    extraTimesUsed: number;
  }
>;

interface UserProfile {
  userId: string;
  lati: number;
  xp: number;
  level: number;
  jobPosition: string | null;

  itemCap: number;
  items: ItemInProfile[];
  specialItems: SpecialItemInProfile[];

  timeCooldowns: TimeCooldown[];

  // "1/1/1970"
  lastDayUsed: string;
  dailyCooldowns: DailyCooldowns;
}

export default UserProfile;
