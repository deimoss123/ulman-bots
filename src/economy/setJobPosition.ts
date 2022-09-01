import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function setJobPosition(
  userId: string,
  guildId: string,
  jobPosition: string
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { jobPosition } },
      { new: true, upsert: true }
    )) as UserProfile;

    if (!userCache[guildId]) userCache[guildId] = {};
    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
