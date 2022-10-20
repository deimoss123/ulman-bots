import { ItemKey } from '../items/itemList';
import { TirgusListings } from '../items/tirgus/generateTirgus';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

export interface ItemAttributes {
  // dīvainai burkāns, kodienu skaits
  timesUsed?: number;

  // dīvainais burkāns un kaķis
  customName?: string;

  // makšķerēm izturība
  durability?: number;

  // kafijas aparāts, pētnieks (unix millis)
  lastUsed?: number;

  // priekš pētnieka, brīvgrieziens
  foundItemKey?: ItemKey;

  // priekš naudas maisa
  latiCollected?: number;

  // priekš loto zivs, "satur x zivis" atribūta
  holdsFishCount?: number;

  // kaķis (unix millis)
  createdAt?: number;
  fedUntil?: number;
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
  'stradat' | 'ubagot' | 'pabalsts',
  {
    timesUsed: number;
    extraTimesUsed: number;
  }
>;

export type UserStatusName = 'aizsargats' | 'laupitajs' | 'juridisks' | 'veiksmigs';
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

interface UserTirgus {
  // "1/1/1970"
  lastDayUsed: string;
  itemsBought: TirgusListings;
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

  tirgus: UserTirgus;
}

export default UserProfile;
