import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function addDailyCooldown(
  userId: string,
  guildId: string,
  commandName: 'stradat' | 'ubagot' | 'pabalsts',
  isExtraUses = false
): Promise<UserProfile | void> {
  try {
    const res = await findUser(userId, guildId);
    if (!res) return;

    const { dailyCooldowns } = res;

    if (isExtraUses) {
      dailyCooldowns[commandName].extraTimesUsed++;
    } else {
      dailyCooldowns[commandName].timesUsed++;
    }

    await User.updateOne({ userId, guildId }, { $set: { dailyCooldowns } });

    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
