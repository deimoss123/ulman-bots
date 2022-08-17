import UserProfile from '../interfaces/UserProfile';
import User, { dailyCooldownDefault } from '../schemas/User';
import userCache from '../utils/userCache';

export default async function resetDailyCooldown(userId: string): Promise<UserProfile | void> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          lastDayUsed: new Date().toLocaleDateString('en-GB'),
          dailyCooldowns: dailyCooldownDefault,
        },
      },
      { new: true }
    )) as UserProfile;

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
