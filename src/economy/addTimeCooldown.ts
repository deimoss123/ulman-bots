import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function addTimeCooldown(
  userId: string,
  commandName: string
): Promise<UserProfile | void> {
  try {
    const res = await findUser(userId);
    if (!res) return;

    const { timeCooldowns } = res;

    const cooldownIndex = timeCooldowns.findIndex((cooldown) => cooldown.name === commandName);
    if (cooldownIndex === -1) {
      timeCooldowns.push({ name: commandName, lastUsed: Date.now() });
    } else {
      timeCooldowns[cooldownIndex].lastUsed = Date.now();
    }

    const resUser = (await User.findOneAndUpdate(
      { userId },
      { $set: { timeCooldowns } },
      { new: true }
    )) as UserProfile;
    userCache[userId] = resUser;

    return JSON.parse(JSON.stringify(resUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
