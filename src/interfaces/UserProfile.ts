import { ItemKey } from '../items/itemList';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

interface UserProfile {
  userId: string;
  lati: number;
  xp: number,
  level: number,
  itemCap: number;
  items: ItemInProfile[];
}

export default UserProfile;