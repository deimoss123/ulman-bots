import { commandList, devCommandList } from './commandList';
import { ChatInputCommandInteraction } from 'discord.js';
import errorEmbed from '../embeds/errorEmbed';
import interactionCache from '../utils/interactionCache';
import ephemeralReply from '../embeds/ephemeralReply';
import logCommand from '../utils/logCommand';
import findUser from '../economy/findUser';
import millisToReadableTime from '../embeds/helpers/millisToReadableTime';
import resetDailyCooldown from '../economy/resetDailyCooldown';

export default async function commandHandler(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply('UlmaņBota komandas var izmantot tikai serveros');
  }

  const userId = interaction.user.id;
  const guildId = interaction.guildId!;

  let command = commandList.find(cmd => cmd.data.name === interaction.commandName);

  if (command) {
    // pārbauda iekš interaction cache vai komanda nav aktīva
    if (interactionCache.get(userId)?.get(command.data.name)?.isInteractionActive) {
      return interaction.reply(ephemeralReply('Šī komanda jau ir aktīva'));
    }

    const user = await findUser(userId, guildId);
    if (!user) return interaction.reply(errorEmbed);

    if (command.cooldown) {
      const currentCooldown = user.timeCooldowns.find(c => c.name === command?.data.name);

      if (currentCooldown) {
        const timePassed = Date.now() - currentCooldown.lastUsed;
        if (timePassed < command.cooldown)
          return interaction.reply(
            ephemeralReply(
              `Komandu **/${command.data.name}** tu varēsi izmantot pēc\n` +
                `\`\`\`${millisToReadableTime(command.cooldown - timePassed)}\`\`\``
            )
          );
      }
    }

    const currentDay = new Date().toLocaleDateString('en-GB');
    if (user.lastDayUsed !== currentDay) await resetDailyCooldown(userId, guildId);

    await command.run(interaction);
    logCommand(interaction);
    return;
  }

  // ja testa komandas KAUT KĀDĀ veidā nokļūst mirstīgu cilvēku rokās, šis neļaus tām strādāt
  if (userId !== process.env.DEV_ID) {
    return interaction.reply(errorEmbed);
  }

  // komandas testēšanai, priekš privāta servera
  command = devCommandList.find(cmd => cmd.data.name === interaction.commandName);
  if (command) await command.run(interaction);
}
