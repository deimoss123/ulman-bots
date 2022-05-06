export interface ItemInProfile {
  name: string;
  amount: number;
}

interface UserProfile {
  guildId: string;
  userId: string;
  lati: number;
  itemCap: number;
  items: ItemInProfile[];
}

export default UserProfile;