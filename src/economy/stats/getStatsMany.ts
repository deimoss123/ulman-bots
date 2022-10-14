import StatsProfile, { UserStats } from '../../interfaces/StatsProfile';
import Stats from '../../schemas/Stats';

export default async function getStatsMany(
  clientId: string,
  guildId: string,
  projection: Partial<Record<keyof UserStats, 1>> = {}
): Promise<StatsProfile[] | null | void> {
  try {
    return await Stats.find({ guildId, userId: { $not: { $eq: clientId } } }, { _id: 0, userId: 1, ...projection });
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
