import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function addDailyCooldown(
  userId: string,
  commandName: 'stradat' | 'ubagot',
  isExtraUses = false
): Promise<UserProfile | void> {
  try {
    const res = await findUser(userId);
    if (!res) return;

    const { dailyCooldowns } = res;

    if (isExtraUses) {
      dailyCooldowns[commandName].extraTimesUsed++;
    } else {
      dailyCooldowns[commandName].timesUsed++;
    }

    await User.updateOne({ userId }, { $set: { dailyCooldowns } });

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
