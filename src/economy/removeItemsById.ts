import { ClientSession } from "mongoose";
import UserProfile from "@/interfaces/UserProfile";
import User from "@/schemas/User";
import userCache from "@/utils/userCache";
import findUser from "@/economy/findUser";

export default async function removeItemsById(
  userId: string,
  guildId: string,
  itemIds: string[],
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const user = await findUser(userId, guildId, session);
    if (!user) return;

    const { specialItems } = user;
    const newItems = specialItems.filter((item) => !itemIds.includes(item._id!));

    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { specialItems: newItems } },
      { new: true },
    ).session(session)) as UserProfile;

    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
