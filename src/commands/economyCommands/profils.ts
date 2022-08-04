import Command from '../../interfaces/Command';
import commandColors from '../../embeds/commandColors';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import userString from '../../embeds/helpers/userString';
import embedTemplate from '../../embeds/embedTemplate';
import levelsList, { MAX_LEVEL } from '../../levelingSystem/levelsList';
import ephemeralReply from '../../embeds/ephemeralReply';
import { JobPositions } from './vakances/vakances';

const profils: Command = {
  title: 'Profils',
  description: 'Apskatīties savu vai kāda lietotāja profilu',
  color: commandColors.profils,
  data: {
    name: 'profils',
    description: 'Apskatīties savu vai kāda lietotāja profilu',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt profilu',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs') ?? i.user;

    const user = await findUser(target.id);
    if (!user) return i.reply(errorEmbed);

    const { level, xp, jobPosition } = user;

    if (target.id === process.env.BOT_ID) {
      return i.reply(ephemeralReply('Tu nevari apskatīt Valsts Bankas profilu'));
    }

    const targetText = target.id === i.user.id ? 'Tavs' : userString(target);

    const XP_BAR_LENGTH = 20;

    let maxLevelText = '**Sasniegts maksimālais līmenis!**\n';
    let maxLevelEmoji = '🔥';
    let xpText = '';

    let xpBar = '';
    if (level !== MAX_LEVEL) {
      maxLevelText = '';
      maxLevelEmoji = '';
      xpText = `| UlmaņPunkti: ${xp}/${levelsList[level + 1]!.xp}`;

      const filledSlots = '#'.repeat(
        Math.round((XP_BAR_LENGTH / levelsList[user.level + 1].xp) * xp)
      );
      xpBar += filledSlots + '-'.repeat(XP_BAR_LENGTH - filledSlots.length);
      xpBar = `**${user.level}** \`[${xpBar}]\` **${user.level + 1}**`;
    }

    await i.reply(
      embedTemplate({
        i,
        color: this.color,
        title: `${targetText} profils`,
        description:
          `Profesija: \`${jobPosition ? JobPositions[jobPosition].name : 'Bezdarbnieks'}\`\n\n` +
          `${maxLevelText}Līmenis: **${level}** ${maxLevelEmoji} ${xpText}\n${xpBar}`,
        fields: [
          {
            name: 'Statusi',
            value: '-',
            inline: false,
          },
        ],
      })
    );
  },
};

export default profils;
