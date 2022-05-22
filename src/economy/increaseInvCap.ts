import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function increaseInvCap(
  userId: string,
  increaseAmount: number,
): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate(
      { userId }, { $inc: { itemCap: increaseAmount } }, { new: true }
    ) as UserProfile;

    userCache[userId] = res
    return res;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}