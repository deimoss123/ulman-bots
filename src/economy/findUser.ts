import UserProfile from '../interfaces/UserProfile'
import profileSchema from '../schemas/profile-schema'

export default async function(guildId: string, userId: string) {
  try {
    let result = await profileSchema.findOne({ guildId, userId })

    if (result) {
      return result as UserProfile
    }

    const newSchema: UserProfile = {
      _id: `${guildId}-${userId}`,
      guildId,
      userId,
      lati: 0
    }

    await new profileSchema(newSchema).save()
    return JSON.parse(JSON.stringify(newSchema)) as UserProfile
  } catch (e) {
    console.log(e, new Date().toString())
  }
}