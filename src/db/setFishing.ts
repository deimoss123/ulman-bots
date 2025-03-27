import { ClientSession } from "mongoose";
import UserProfile, { UserFishing } from "@/interfaces/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";
import findUser from "@/db/findUser";

export default async function setFishing(
  userId: string,
  guildId: string,
  fishing: Partial<UserFishing>,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const user = await findUser(userId, guildId, session);
    if (!user) return;

    user.fishing = { ...user.fishing, ...fishing };

    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { fishing: user.fishing } },
      { new: true },
    ).session(session)) as UserProfile;

    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
