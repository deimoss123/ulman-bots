import User from '../schemas/User';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';

export default async function addLati(
  userId: string,
  guildId: string,
  lati: number
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $inc: { lati } },
      { new: true, upsert: true }
    )) as UserProfile;

    if (!userCache[guildId]) userCache[guildId] = {};
    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
