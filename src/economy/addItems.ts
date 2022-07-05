import findUser from './findUser';
import User from '../schemas/User';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';
import { ItemKey } from '../items/itemList';

export default async function addItems(
  userId: string,
  itemsToAdd: Record<ItemKey, number>
): Promise<UserProfile | undefined> {
  try {
    const user = await findUser(userId);
    if (!user) return;

    const { items } = user;

    for (const [itemToAdd, amountToAdd] of Object.entries(itemsToAdd)) {
      if (amountToAdd === 0) continue;

      // meklē lietotāja inventārā itemToAdd
      const itemIndex = items.findIndex((item) => item.name === itemToAdd);

      // ja nav lietotājam datubāzē, tad ievieto jaunu item objektu
      if (itemIndex === -1) {
        if (amountToAdd <= 0) continue; // ja nav datubāzē, tad nav ko atņemt

        items.push({ name: itemToAdd, amount: amountToAdd });
        continue;
      }

      // ir datubāzē bet tiek atņemts visas (vai vairāk) mantas
      if (items[itemIndex].amount + amountToAdd <= 0) {
        items.splice(itemIndex, 1);
        continue;
      }

      items[itemIndex].amount += amountToAdd;
    }

    const res = (await User.findOneAndUpdate(
      { userId },
      { $set: { items } },
      { new: true }
    )) as UserProfile;

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
