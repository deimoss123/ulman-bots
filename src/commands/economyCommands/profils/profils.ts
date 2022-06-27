import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import profilsConfig from './profilsConfig';
import { CommandInteraction } from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import userString from '../../../embeds/helpers/userString';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import getLevel from '../../../levelingSystem/getLevel';
import levelsList from '../../../levelingSystem/levelsList';
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
    
    if (target.id === process.env.BOT_ID) {
      return i.reply(ephemeralReply('Tu nevari apskatīt Valsts Bankas profilu'))
    }
    
    const targetText = target.id === i.user.id ? 'Tavs' : userString(target)
    
    const { excessXp, level } = getLevel(user.xp);
    
    await i.reply(embedTemplate({
      i,
      color: this.color,
      title: `${targetText} profils`,
      description:
        `Kopā ${user.xp} UlmaņPunkti\n` +
        `Līmenis: ${level}\n` +
        `${excessXp}/${levelsList[level + 1].xp} UlmaņPunkti`,
      fields: [
        {
          name: 'Statusi',
          value: '-',
          inline: false,
        },
      ],
    }));
  },
};

export default profils;