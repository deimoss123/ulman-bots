import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import { CommandInteraction } from 'discord.js';
import izmantotConfig from './izmantotConfig';
import findItemById from '../../../items/helpers/findItemById';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';

const izmantot: Command = {
  title: 'Izmantot',
  description: 'Izmantot kādu lietu no inventāra',
  color: commandColors.izmantot,
  config: izmantotConfig,
  async run(i: CommandInteraction) {
    const itemToUseId = i.options.data[0].value as string

    const itemToUse = findItemById(itemToUseId)
    if (!itemToUse) {
      await i.reply(wrongIdEmbed(itemToUseId))
      return
    }

    if (!itemToUse.item.use) {
     await i.reply(ephemeralReply(
       `${itemString(itemToUse.item)} nav izmantojams`
     ))
     return
    }

    const user = await findUser(i.user.id)
    if (!user) {
      await i.reply(errorEmbed)
      return
    }

    const { items } = user

    const itemInInv = items.find(({ name }) => name === itemToUse.key)
    if (!itemInInv) {
      await i.reply(ephemeralReply(
        `Tev inventārā nav ${itemString(itemToUse.item)}`
      ))
      return
    }


  }
}

export default izmantot