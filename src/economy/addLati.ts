import User from '../schemas/User';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';

export default async function addLati(
  userId: string,
  lati: number,
): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate(
      { userId }, { $inc: { lati } }, { new: true },
    ) as UserProfile;

    userCache[userId] = res;
    return res;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}