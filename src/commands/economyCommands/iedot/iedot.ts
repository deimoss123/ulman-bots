import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import embedTemplate from '../../../embeds/embedTemplate';
import addItems from '../../../economy/addItems';
import countItems from '../../../items/helpers/countItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import iedotConfig from './iedotConfig';
import commandColors from '../../../embeds/commandColors';
import iedotAutocomplete from './iedotAutocomplete';
import itemList from '../../../items/itemList';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';

const iedot: Command = {
  title: 'Iedot',
  description: 'Iedot citam lietotājam kādu lietu',
  color: commandColors.iedot,
  config: iedotConfig,
  autocomplete: iedotAutocomplete,
  async run(i: CommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const itemToGiveKey = i.options.getString('nosaukums')!;
    const amountToGive = i.options.getInteger('daudzums') ?? 1;

    if (target.id === i.user.id) {
      await i.reply(ephemeralReply('Tu nevari iedot sev'));
      return;
    }

    if (target.id === process.env.BOT_ID) {
      await i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
      return;
    }

    const itemToGive = itemList[itemToGiveKey];
    if (!itemToGive) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    const user = await findUser(i.user.id);

    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    const { items } = user;

    const itemInInv = items.find(({ name }) => name === itemToGiveKey);
    if (!itemInInv) {
      await i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
      return;
    }

    if (itemInInv.amount < amountToGive) {
      await i.reply(
        ephemeralReply(
          `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
            `Tev inventārā ir tikai ${itemString(itemToGive, itemInInv.amount)}`
        )
      );
      return;
    }

    const targetUser = await findUser(target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    if (amountToGive > targetUser.itemCap - countItems(targetUser.items)) {
      await i.reply(
        ephemeralReply(
          `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
            `<@${target.id}> inventārā ir **${countFreeInvSlots(targetUser)}** brīvas vietas`
        )
      );
      return;
    }

    const targetUserAfter = await addItems(target.id, { [itemToGiveKey]: amountToGive });
    const res = await addItems(i.user.id, { [itemToGiveKey]: -amountToGive });

    if (!res || !targetUserAfter) {
      await i.reply(errorEmbed);
      return;
    }

    const targetUserItem = targetUserAfter.items.find(({ name }) => name === itemToGiveKey)!;

    await i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description: `Tu iedevi <@${target.id}> ${itemString(itemToGive, amountToGive, true)}`,
        color: this.color,
        fields: [
          {
            name: 'Tev palika',
            value: itemString(itemToGive, itemInInv.amount - amountToGive),
            inline: true,
          },
          {
            name: 'Tagad viņam ir',
            value: itemString(itemToGive, targetUserItem.amount),
            inline: true,
          },
        ],
      })
    );
  },
};

export default iedot;
