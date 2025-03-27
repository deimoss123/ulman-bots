import { ClientSession } from "mongoose";
import UserProfile from "@/types/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";
import findUser from "@/db/findUser";

export default async function addDailyCooldown(
  userId: string,
  guildId: string,
  commandName: "stradat" | "ubagot" | "pabalsts",
  isExtraUses = false,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = await findUser(userId, guildId, session);
    if (!res) return;

    const { dailyCooldowns } = res;

    if (isExtraUses) {
      dailyCooldowns[commandName].extraTimesUsed++;
    } else {
      dailyCooldowns[commandName].timesUsed++;
    }

    await User.updateOne({ userId, guildId }, { $set: { dailyCooldowns } }).session(session);

    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
