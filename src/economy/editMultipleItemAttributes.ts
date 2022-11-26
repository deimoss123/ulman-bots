import UserProfile, { ItemAttributes, SpecialItemInProfile } from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function editMultipleItemAttributes(
  userId: string,
  guildId: string,
  itemsToChange: { itemId: string; newAttributes: ItemAttributes }[]
): Promise<{ user: UserProfile; newItems: SpecialItemInProfile[] } | void> {
  try {
    const user = await findUser(userId, guildId);
    if (!user) return;

    const { specialItems } = user;
    const newItems: SpecialItemInProfile[] = [];

    for (const { itemId, newAttributes } of itemsToChange) {
      const itemIndex = specialItems.findIndex(i => i._id === itemId);
      if (itemIndex === -1) return;

      specialItems[itemIndex].attributes = newAttributes;
      newItems.push(specialItems[itemIndex]);
    }

    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { specialItems } },
      { new: true }
    )) as UserProfile;

    userCache[guildId][userId] = res;

    return { user: JSON.parse(JSON.stringify(res)), newItems };
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
