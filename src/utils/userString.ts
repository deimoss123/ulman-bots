import { User } from 'discord.js'

export default function(user: User) {
  return `${user.username}#${user.discriminator}`
}