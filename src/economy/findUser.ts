import UserProfile from '../interfaces/UserProfile'
import User from '../schemas/User'

export default async function(guildId: string, userId: string) {
  try {
    let result = await User.findOne({ guildId, userId })

    if (result) {
      return result as UserProfile
    }

    const newSchema: UserProfile = {
      guildId,
      userId,
      lati: 0,
    }

    const newUser = await new User(newSchema)
    newUser.save()

    return newUser as UserProfile
  } catch (e) {
    // @ts-ignore
    console.log(e.message, new Date().toString())
  }
}