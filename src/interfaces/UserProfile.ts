interface ItemInProfile {
  name: string;
  amount: number;
}

interface UserProfile {
  guildId: string;
  userId: string;
  lati: number;
  items: ItemInProfile[];
}

export default UserProfile;