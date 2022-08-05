import { ItemKey } from '../items/itemList';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

export interface TimeCooldown {
  name: string;
  lastUsed: number;
}

export interface DailyCooldown {
  name: string;
  timesUsed: number;
  dateWhenUsed: Date;
}

interface UserProfile {
  userId: string;
  lati: number;
  xp: number;
  level: number;
  jobPosition: string | null;
  itemCap: number;
  items: ItemInProfile[];
  timeCooldowns: TimeCooldown[];
  dailyCooldowns: DailyCooldown[];
}

export default UserProfile;
