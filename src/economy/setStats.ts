import UserProfile, { UserStats } from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

type StatsParam = Partial<Record<keyof UserStats, number | `=${number}`>>;

export default async function setStats(
  userId: string,
  guildId: string,
  stats: StatsParam
): Promise<UserProfile | void> {
  try {
    const user = await findUser(userId, guildId);
    if (!user) return;

    const { statistika } = user;

    for (const entry of Object.entries(stats)) {
      const key = entry[0] as keyof UserStats;
      const value = entry[1];

      console.log(entry);

      if (typeof value === 'string') {
        if (!isNaN(+value.slice(1))) {
          statistika[key] = +value.slice(1);
        }
      } else {
        statistika[key] = (statistika[key] || 0) + value;
      }

      console.log(statistika[key]);
    }

    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { statistika } },
      { new: true }
    )) as UserProfile;

    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
