import { ClientSession } from "mongoose";
import UserProfile, { SpecialItemInProfile } from "@/types/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";

export default async function addSpecialItems(
  userId: string,
  guildId: string,
  itemsToAdd: SpecialItemInProfile[],
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $push: { specialItems: itemsToAdd } },
      { new: true },
    ).session(session)) as UserProfile;

    // if (!userCache[guildId]) userCache[guildId] = {};
    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
