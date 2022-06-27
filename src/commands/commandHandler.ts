import { commandList, devCommandList } from './commandList';
import { CommandInteraction } from 'discord.js';
import errorEmbed from '../embeds/errorEmbed';
import interactionCache from '../utils/interactionCache';
import ephemeralReply from '../embeds/ephemeralReply';
import logCommand from '../utils/logCommand';

export default async function commandHandler(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply('UlmaņBota komandas var izmantot tikai serveros');
    return;
  }

  let command = commandList.find((cmd) => cmd.config.name === interaction.commandName);

  if (command) {
    // pārbauda iekš interaction cache vai komanda nav aktīva
    if (interactionCache?.[interaction.user.id]?.[command.config.name]?.isInteractionActive) {
      await interaction.reply(ephemeralReply('Šī komanda jau ir aktīva'));
      return;
    }

    await command.run(interaction);
    logCommand(interaction);
    return;
  }

  // ja testa komandas KAUT KĀDĀ veidā nokļūst mirstīgu cilvēku rokās, šis neļaus tām strādāt
  if (interaction.user.id !== process.env.DEV_ID) {
    await interaction.reply(errorEmbed);
    return;
  }

  // komandas testēšanai, priekš privāta servera
  command = devCommandList.find((cmd) => cmd.config.name === interaction.commandName);
  if (command) await command.run(interaction);
}