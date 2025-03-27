import StatsProfile from "@/types/StatsProfile";
import Stats from "@/schemas/Stats";
import { ClientSession, ProjectionType } from "mongoose";

export default async function getStatsMany(
  clientId: string,
  guildId: string,
  projection: ProjectionType<StatsProfile>,
  session: ClientSession | null = null,
): Promise<StatsProfile[] | undefined> {
  try {
    const res = await Stats.find(
      { guildId, userId: { $not: { $eq: clientId } } },
      // @ts-ignore
      { _id: 0, userId: 1, ...projection },
    ).session(session);
    if (!res) return;

    return JSON.parse(JSON.stringify(res)) as StatsProfile[];
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
