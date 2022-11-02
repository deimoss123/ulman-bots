import UserProfile from '../interfaces/UserProfile';
import { ItemKey } from '../items/itemList';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function setTirgus(
  userId: string,
  guildId: string,
  itemKey: ItemKey
): Promise<UserProfile | void> {
  try {
    const user = await findUser(userId, guildId);
    if (!user) return;

    const today = new Date().toLocaleDateString('en-GB');
    if (user.tirgus.lastDayUsed !== today) {
      user.tirgus.lastDayUsed = today;
      user.tirgus.itemsBought = [];
    }

    user.tirgus.itemsBought.push(itemKey);

    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { tirgus: user.tirgus } },
      { new: true }
    )) as UserProfile;

    userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
