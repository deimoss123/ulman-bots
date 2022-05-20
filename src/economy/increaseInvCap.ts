import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';

export default async function increaseInvCap(
  userId: string,
  increaseAmount: number,
): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate({ userId }, { $inc: { itemCap: increaseAmount } }, { new: true });
    return res as UserProfile;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}