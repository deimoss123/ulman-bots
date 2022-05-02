import { User } from 'discord.js'

export default function(user: User, isBlue: boolean = false) {
  return isBlue ?
    `[${user.username}#${user.discriminator}](https://www.youtube.com/watch?v=j7dCvf5RL24)` :
    `${user.username}#${user.discriminator}`
}