import { ChatInputCommandInteraction } from 'discord.js';
import chalk from 'chalk';

export default function logCommand(i: ChatInputCommandInteraction) {
  console.log(
    [
      new Date().toLocaleString('en-GB'),
      chalk.blueBright(`[${i.guild!.name}]`),
      chalk.bold(`${i.user.username}#${i.user.discriminator}`),
      chalk.gray(`(${i.guildId})`),
      i.toString().substring(1),
    ].join(' ')
  );
}
