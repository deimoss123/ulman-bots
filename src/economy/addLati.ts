import User from '../schemas/User';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';

export default async function addLati(
  userId: string,
  lati: number
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId },
      { $inc: { lati } },
      { new: true, upsert: true }
    )) as UserProfile;

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
