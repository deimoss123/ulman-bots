import { UserStats } from '../../interfaces/StatsProfile';
import Stats from '../../schemas/Stats';

type StatsParam = Partial<Record<keyof UserStats, number | `=${number}`>>;

export default async function setStats(userId: string, guildId: string, stats: StatsParam): Promise<void> {
  try {
    const toInc: Partial<Record<keyof UserStats, number>> = {};
    const toMax: Partial<Record<keyof UserStats, number>> = {};

    for (const entry of Object.entries(stats)) {
      const key = entry[0] as keyof UserStats;
      const value = entry[1];

      if (typeof value === 'string') {
        if (!isNaN(+value.slice(1))) {
          toMax[key] = +value.slice(1);
        }
        continue;
      }

      toInc[key] = value;
    }

    await Stats.updateOne({ userId, guildId }, { $max: toMax, $inc: toInc }, { upsert: true });
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
