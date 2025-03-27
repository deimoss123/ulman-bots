import { ClientSession } from "mongoose";
import { UserStats } from "@/types/StatsProfile";
import Stats from "@/schemas/Stats";

export default async function getStats(
  userId: string,
  guildId: string,
  session: ClientSession | null = null,
): Promise<UserStats | undefined> {
  try {
    const res = await Stats.findOne({ userId, guildId }, { _id: 0, userId: 0, guildId: 0 }).session(session);
    if (!res) return;

    return res;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
