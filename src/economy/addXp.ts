import User from '../schemas/User';
import { Snowflake } from 'discord.js';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';

export default async function addXp(
  userId: Snowflake,
  xp: number,
): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate(
      { userId }, { $inc: { xp } }, { new: true },
    ) as UserProfile;

    userCache[userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}