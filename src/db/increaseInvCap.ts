import { ClientSession } from "mongoose";
import UserProfile from "@/types/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";

export default async function increaseInvCap(
  userId: string,
  guildId: string,
  increaseAmount: number,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $inc: { itemCap: increaseAmount } },
      { new: true, upsert: true },
    ).session(session)) as UserProfile;

    // if (!userCache[guildId]) userCache[guildId] = {};
    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
