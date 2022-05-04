import User from '../schemas/User'
import UserProfile from '../interfaces/UserProfile'

export default async function(
  guildId: string,
  userId: string,
  lati: number,
): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate({ guildId, userId }, { $inc: { lati } }, { new: true })
    return res!
  } catch (e) {
    // @ts-ignore
    console.log(e.message, new Date().toString())
  }
}