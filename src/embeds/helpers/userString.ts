import { User } from 'discord.js';

export default function userString(user: User, isBlue = false) {
  return isBlue
    ? `[${user.username}#${user.discriminator}](https://www.youtube.com/watch?v=j7dCvf5RL24)`
    : `${user.username}#${user.discriminator}`;
}
