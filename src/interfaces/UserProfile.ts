import { ItemKey } from '../items/itemList';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

export interface ItemAttributes {
  // dīvainā burkāna atribūti
  timesUsed?: number;
  customName?: string;

  // makšķerēm
  durability?: number;

  lastUsed?: number; // kafijas aparāts, pētnieks (unix millis)
  foundItemKey?: ItemKey; // priekš pētnieka, brīvgrieziens
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

export type UserStatusName = 'aizsargats' | 'laupitajs' | 'juridisks';
export type UserStatus = Record<UserStatusName, number>;

export interface FishObj {
  time: number;
  itemKey: ItemKey;
}

export interface UserFishing {
  maxCapacity: number;
  selectedRod: string | null;
  usesLeft: number;
  lastCaughtFish: FishObj | null;
  futureFishList: FishObj[] | null;
  caughtFishes: Record<ItemKey, number> | null;
}

export interface UserStats {
  spentShop: number;
  soldShop: number;
  taxPaid: number;
  paidLati: number;
  receivedLati: number;
  stolenLati: number;
  lostStealingLati: number;

  caughtFishCount: number;
  timeSpentFishing: number;

  fenkaBiggestWin: number;
  fenkaBiggestBet: number;
  fenkaSpent: number;
  fenkaWon: number;
  fenkaSpinCount: number;

  rulBiggestWin: number;
  rulBiggestBet: number;
  rulSpent: number;
  rulWon: number;
  rulSpinCount: number;
}
interface UserProfile {
  userId: string;
  guildId: string;
  lati: number;
  xp: number;
  level: number;
  jobPosition: string | null;

  itemCap: number;
  items: ItemInProfile[];
  specialItems: SpecialItemInProfile[];

  payTax: number;
  giveTax: number;

  timeCooldowns: TimeCooldown[];

  // "1/1/1970"
  lastDayUsed: string;
  dailyCooldowns: DailyCooldowns;

  status: UserStatus;

  fishing: UserFishing;
}

export default UserProfile;
