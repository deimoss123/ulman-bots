import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import profilsConfig from './profilsConfig';
import { CommandInteraction } from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import userString from '../../../embeds/helpers/userString';
import embedTemplate from '../../../embeds/embedTemplate';
import levelsList, { MAX_LEVEL } from '../../../levelingSystem/levelsList';
import ephemeralReply from '../../../embeds/ephemeralReply';

const profils: Command = {
  title: 'Profils',
  description: 'Apskatīties savu vai kāda lietotāja profilu',
  color: commandColors.profils,
  config: profilsConfig,
  async run(i: CommandInteraction) {
    const target = i.options.data[0]?.user || i.user;

    const user = await findUser(target.id);
    if (!user) return i.reply(errorEmbed);

    const { level, xp } = user;

    if (target.id === process.env.BOT_ID) {
      return i.reply(ephemeralReply('Tu nevari apskatīt Valsts Bankas profilu'));
    }

    const targetText = target.id === i.user.id ? 'Tavs' : userString(target);

    await i.reply(
      embedTemplate({
        i,
        color: this.color,
        title: `${targetText} profils`,
        description:
          `Līmenis: **${level}** ${level === MAX_LEVEL ? 'MAX' : ''}\n` +
          (level === MAX_LEVEL
            ? `${levelsList[level].xp}/${levelsList[level].xp}`
            : `${xp}/${levelsList[level + 1].xp}`) +
          ` UlmaņPunkti`,
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
