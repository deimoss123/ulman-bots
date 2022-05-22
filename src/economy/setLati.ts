import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function setLati(userId: string, lati: number): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate(
      { userId }, { $set: { lati } }, { new: true }
    ) as UserProfile;

    userCache[userId] = res

    return res;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}