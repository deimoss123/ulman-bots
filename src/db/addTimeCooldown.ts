import { ClientSession } from "mongoose";
import UserProfile from "@/types/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";
import findUser from "@/db/findUser";

export default async function addTimeCooldown(
  userId: string,
  guildId: string,
  commandName: string,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = await findUser(userId, guildId, session);
    if (!res) return;

    const { timeCooldowns } = res;

    const cooldownIndex = timeCooldowns.findIndex((cooldown) => cooldown.name === commandName);
    if (cooldownIndex === -1) {
      timeCooldowns.push({ name: commandName, lastUsed: Date.now() });
    } else {
      timeCooldowns[cooldownIndex].lastUsed = Date.now();
    }

    const resUser = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { timeCooldowns } },
      { new: true },
    ).session(session)) as UserProfile;

    // userCache[guildId][userId] = resUser;

    return JSON.parse(JSON.stringify(resUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
