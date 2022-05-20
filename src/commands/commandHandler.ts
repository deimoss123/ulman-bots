import { commandList, devCommandList } from './commandList';
import { CommandInteraction } from 'discord.js';
import errorEmbed from '../embeds/errorEmbed';

export default async function(interaction: CommandInteraction) {

  if (!interaction.guild) {
    await interaction.reply('UlmaņBota komandas var izmantot tikai serveros');
    return;
  }

  let command = commandList.find(cmd => cmd.config.name === interaction.commandName);

  if (command) {
    await command.run(interaction);
    return;
  }

  // ja testa komandas KAUT KĀDĀ veidā nokļūst mirstīgu cilvēku rokās, šis neļaus tām strādāt
  if (interaction.user.id !== process.env.DEV_ID) {
    await interaction.reply(errorEmbed);
    return;
  }

  // komandas testēšanai, priekš privāta servera
  command = devCommandList.find(cmd => cmd.config.name === interaction.commandName);
  if (command) {
    await command.run(interaction);
  }
}