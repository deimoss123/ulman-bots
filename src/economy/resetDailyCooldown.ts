import UserProfile from '../interfaces/UserProfile';
import User, { dailyCooldownDefault } from '../schemas/User';
import userCache from '../utils/userCache';

export default async function resetDailyCooldown(
  userId: string,
  guildId: string
): Promise<UserProfile | void> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      {
        $set: {
          lastDayUsed: new Date().toLocaleDateString('en-GB'),
          dailyCooldowns: dailyCooldownDefault,
        },
      },
      { new: true, upsert: true }
    )) as UserProfile;

    if (!userCache[guildId]) userCache[guildId] = {};
    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
