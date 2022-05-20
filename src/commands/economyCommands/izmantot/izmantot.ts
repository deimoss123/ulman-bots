import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import { CommandInteraction, EmbedField } from 'discord.js';
import izmantotConfig from './izmantotConfig';
import findItemById from '../../../items/helpers/findItemById';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import embedTemplate from '../../../embeds/embedTemplate';
import ItemString from '../../../embeds/helpers/itemString';
import addItems from '../../../economy/addItems';
import izmantotRun from './izmantotRun';

const izmantot: Command = {
  title: 'Izmantot',
  description: 'Izmantot kādu lietu no inventāra',
  color: commandColors.izmantot,
  config: izmantotConfig,
  async run(i: CommandInteraction) {
    const itemToUseId = i.options.data[0].value as string;

    const itemToUse = findItemById(itemToUseId);
    if (!itemToUse) {
      await i.reply(wrongIdEmbed(itemToUseId));
      return;
    }

    if (!itemToUse.item.use) {
      await i.reply(ephemeralReply(
        `**${itemString(itemToUse.item)}** nav ` +
        (itemToUse.item.isVirsiesuDzimte ? 'izmantojams' : 'izmantojama'),
      ));
      return;
    }

    await izmantotRun(i, itemToUse.key, this.color);
  },
};

export default izmantot;