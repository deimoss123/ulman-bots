import User from '@/schemas/User';
import UserProfile from '@/interfaces/UserProfile';
import userCache from '@/utils/userCache';
import { ClientSession } from 'mongoose';

export default async function addLati(
  userId: string,
  guildId: string,
  lati: number,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $inc: { lati } },
      { new: true, upsert: true },
    ).session(session)) as UserProfile;

    // if (userId === '515267450929938434') throw new Error('Test Error');

    // if (!userCache[guildId]) userCache[guildId] = {};
    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res));
  } catch (e: any) {
    console.log(new Date().toLocaleString(), { userId, guildId, lati }, e.message);
  }
}
