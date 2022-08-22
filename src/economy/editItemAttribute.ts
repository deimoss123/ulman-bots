import UserProfile, { ItemAttributes, SpecialItemInProfile } from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function editItemAttribute(
  userId: string,
  itemId: string,
  newAttributes: ItemAttributes
): Promise<{ user: UserProfile; newItem: SpecialItemInProfile } | void> {
  try {
    const user = await findUser(userId);
    if (!user) return;

    const { specialItems } = user;

    const itemIndex = specialItems.findIndex((i) => i._id === itemId);
    if (itemIndex === -1) return;

    specialItems[itemIndex].attributes = newAttributes;

    const res = (await User.findOneAndUpdate(
      { userId },
      { $set: { specialItems } },
      { new: true }
    )) as UserProfile;

    userCache[userId] = res;

    return { user: JSON.parse(JSON.stringify(res)), newItem: specialItems[itemIndex] };
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
