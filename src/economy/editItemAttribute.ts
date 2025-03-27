import { ClientSession } from 'mongoose';
import UserProfile, { ItemAttributes, SpecialItemInProfile } from '@/interfaces/UserProfile';
import User from '@/schemas/User';
import userCache from '@/utils/userCache';
import findUser from '@/economy/findUser';

export default async function editItemAttribute(
  userId: string,
  guildId: string,
  itemId: string,
  newAttributes: ItemAttributes,
  session: ClientSession | null = null,
): Promise<{ user: UserProfile; newItem: SpecialItemInProfile } | undefined> {
  try {
    const user = await findUser(userId, guildId, session);
    if (!user) return;

    const { specialItems } = user;

    const itemIndex = specialItems.findIndex(i => i._id === itemId);
    if (itemIndex === -1) return;

    specialItems[itemIndex].attributes = newAttributes;

    // prettier-ignore
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { specialItems } },
      { new: true }
    ).session(session)) as UserProfile;

    // userCache[guildId][userId] = res;

    return { user: JSON.parse(JSON.stringify(res)), newItem: specialItems[itemIndex] };
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
