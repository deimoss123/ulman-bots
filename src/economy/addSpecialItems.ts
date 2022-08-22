import UserProfile, { SpecialItemInProfile } from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function addSpecialItems(
  userId: string,
  itemsToAdd: SpecialItemInProfile[]
): Promise<UserProfile | void> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId },
      { $push: { specialItems: itemsToAdd } },
      { new: true }
    )) as UserProfile;

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
