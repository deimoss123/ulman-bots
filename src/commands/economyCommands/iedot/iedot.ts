import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import findItemById from '../../../items/helpers/findItemById';
import ephemeralReply from '../../../embeds/ephemeralReply';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import embedTemplate from '../../../embeds/embedTemplate';
import addItems from '../../../economy/addItems';
import countItems from '../../../items/helpers/countItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';
import iedotConfig from './iedotConfig';
import commandColors from '../../../embeds/commandColors';

const iedot: Command = {
  title: 'Iedot',
  description: 'Iedot citam lietotājam kādu lietu',
  color: commandColors.iedot,
  config: iedotConfig,
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!;
    const itemToGiveId = i.options.data[1].value as string;
    const amountToGive = i.options.data[2]?.value as number ?? 1;

    if (target.id === i.user.id) {
      await i.reply(ephemeralReply('Tu nevari iedot sev'));
      return;
    }

    if (target.id === process.env.BOT_ID) {
      await i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
      return;
    }

    const itemToGive = findItemById(itemToGiveId);
    if (!itemToGive) {
      await i.reply(wrongIdEmbed(itemToGiveId));
      return;
    }

    const user = await findUser(i.user.id);

    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    const { items } = user;

    const itemInInv = items.find(({ name }) => name === itemToGive.key);
    if (!itemInInv) {
      await i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive.item)}`));
      return;
    }

    if (itemInInv.amount < amountToGive) {
      await i.reply(ephemeralReply(
        `Tu nevari iedot ${itemString(itemToGive.item, amountToGive, true)}\n` +
        `Tev inventārā ir tikai ${itemString(itemToGive.item, itemInInv.amount)}`,
      ));
      return;
    }

    const targetUser = await findUser(target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    if (amountToGive > targetUser.itemCap - countItems(targetUser.items)) {
      await i.reply(ephemeralReply(
        `Tu nevari iedot ${itemString(itemToGive.item, amountToGive, true)}\n` +
        `<@${target.id}> inventārā ir **${countFreeInvSlots(targetUser)}** brīvas vietas`,
      ));
      return;
    }

    const targetUserAfter = await addItems(target.id, { [itemToGive.key]: amountToGive });
    const res = await addItems(i.user.id, { [itemToGive.key]: -amountToGive });

    if (!res || !targetUserAfter) {
      await i.reply(errorEmbed);
      return;
    }

    const targetUserItem = targetUserAfter.items.find(({ name }) => name === itemToGive.key)!;

    await i.reply(embedTemplate({
      i,
      content: `<@${target.id}>`,
      description: `Tu iedevi <@${target.id}> ${itemString(itemToGive.item, amountToGive, true)}`,
      color: this.color,
      fields: [
        {
          name: 'Tev palika',
          value: itemString(itemToGive.item, itemInInv.amount - amountToGive),
          inline: true,
        }, {
          name: 'Tagad viņam ir',
          value: itemString(itemToGive.item, targetUserItem.amount),
          inline: true,
        },
      ],
    }));
  },
};

export default iedot;