import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import embedTemplate from '../../../embeds/embedTemplate';
import addItems from '../../../economy/addItems';
import countItems from '../../../items/helpers/countItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import commandColors from '../../../embeds/commandColors';
import iedotAutocomplete from './iedotAutocomplete';
import itemList from '../../../items/itemList';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';

const iedot: Command = {
  title: 'Iedot',
  description: 'Iedot citam lietotājam kādu lietu',
  color: commandColors.iedot,
  data: {
    name: 'iedot',
    description: 'Iedot citam lietotājam kādu lietu',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam iedot',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'nosaukums',
        description: 'Lieta ko vēlies iedot',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: 'daudzums',
        description: 'Cik lietas daudz iedot',
        type: ApplicationCommandOptionType.Integer,
        min_value: 1,
      },
    ],
  },
  autocomplete: iedotAutocomplete,
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const itemToGiveKey = i.options.getString('nosaukums')!;
    const amountToGive = i.options.getInteger('daudzums') ?? 1;

    if (target.id === i.user.id) {
      return i.reply(ephemeralReply('Tu nevari iedot sev'));
    }

    if (target.id === i.guild?.members?.me?.id) {
      return i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
    }

    const itemToGive = itemList[itemToGiveKey];
    if (!itemToGive) return i.reply(wrongKeyEmbed);

    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const { items } = user;

    const itemInInv = items.find(({ name }) => name === itemToGiveKey);
    if (!itemInInv) {
      return i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
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
    if (!targetUser) return i.reply(errorEmbed);

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

    if (!res || !targetUserAfter) return i.reply(errorEmbed);

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
