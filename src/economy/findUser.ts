import UserProfile from '../interfaces/UserProfile';
import Stats from '../schemas/Stats';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function findUser(userId: string, guildId: string): Promise<UserProfile | undefined> {
  try {
    if (userCache[guildId]?.[userId]) return JSON.parse(JSON.stringify(userCache[guildId][userId]));

    const result = (await User.findOne({ userId, guildId })) as UserProfile;

    if (result) {
      if (!userCache[guildId]) userCache[guildId] = {};
      userCache[guildId][userId] = result;
      return JSON.parse(JSON.stringify(result));
    }

    const [newUser, newStats] = await Promise.all([new User({ userId, guildId }), new Stats({ userId, guildId })]);
    await Promise.all([newUser.save(), newStats.save()]);

    if (!userCache[guildId]) userCache[guildId] = {};
    userCache[guildId][userId] = newUser as UserProfile;
    return JSON.parse(JSON.stringify(newUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
