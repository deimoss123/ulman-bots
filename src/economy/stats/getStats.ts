import { UserStats } from '../../interfaces/StatsProfile';
import Stats from '../../schemas/Stats';

export default async function getStats(userId: string, guildId: string): Promise<UserStats | null | void> {
  try {
    return await Stats.findOne({ userId, guildId }, { _id: 0, userId: 0, guildId: 0 });
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
