import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function findUser(
  userId: string,
  guildId: string
): Promise<UserProfile | undefined> {
  try {
    if (userCache[guildId]?.[userId]) return JSON.parse(JSON.stringify(userCache[guildId][userId]));

    const result = (await User.findOne({ userId, guildId })) as UserProfile;

    if (result) {
      if (!userCache[guildId]) userCache[guildId] = {};
      userCache[guildId][userId] = result;
      return JSON.parse(JSON.stringify(result));
    }

    const newUser = await new User({ userId, guildId });
    newUser.save();

    if (!userCache[guildId]) userCache[guildId] = {};
    userCache[guildId][userId] = newUser as UserProfile;
    return JSON.parse(JSON.stringify(newUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
