import User from '../schemas/User'

export default async function(
  guildId: string,
  userId: string,
  lati: number
): Promise<void> {
  try {
    await User.updateOne({ guildId, userId }, { $inc: { lati } })
  } catch (e) {
    // @ts-ignore
    console.log(e.message, new Date().toString())
  }
}