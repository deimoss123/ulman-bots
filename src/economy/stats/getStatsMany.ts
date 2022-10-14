import StatsProfile from '../../interfaces/StatsProfile';
import Stats from '../../schemas/Stats';
import { ProjectionType } from 'mongoose';

export default async function getStatsMany(
  clientId: string,
  guildId: string,
  projection: ProjectionType<StatsProfile>
): Promise<StatsProfile[] | undefined> {
  try {
    const res = await Stats.find(
      { guildId, userId: { $not: { $eq: clientId } } },
      // @ts-ignore
      { _id: 0, userId: 1, ...projection }
    );
    if (!res) return;

    return JSON.parse(JSON.stringify(res)) as StatsProfile[];
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
