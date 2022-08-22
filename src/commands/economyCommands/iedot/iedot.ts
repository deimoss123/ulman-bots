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
import latiString from '../../../embeds/helpers/latiString';
import addLati from '../../../economy/addLati';
import iedotRunSpecial from './iedotRunSpecial';

const IEDOT_NODOKLIS = 0.2;

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

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
    }

    const itemToGive = itemList[itemToGiveKey];
    if (!itemToGive) return i.reply(wrongKeyEmbed);

    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const targetUser = await findUser(target.id);
    if (!targetUser) return i.reply(errorEmbed);

    const { lati, items, specialItems } = user;

    if (itemToGive.attributes) {
      const specialItemInv = specialItems.filter(({ name }) => name === itemToGiveKey);
      if (!specialItemInv.length) {
        return i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
      }
      return iedotRunSpecial(i, targetUser, itemToGiveKey, specialItemInv, this.color);
    }

    const itemInInv = items.find(({ name }) => name === itemToGiveKey);
    if (!itemInInv) {
      return i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
    }

    if (itemInInv.amount < amountToGive) {
      return i.reply(
        ephemeralReply(
          `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
            `Tev inventārā ir tikai ${itemString(itemToGive, itemInInv.amount)}`
        )
      );
    }

    const totalTax = Math.floor(itemToGive.value * amountToGive * IEDOT_NODOKLIS) || 1;

    if (user.lati < totalTax) {
      return i.reply(
        ephemeralReply(
          `Tev nepietiek naudas lai samaksātu iedošanas nodokli (${itemString(
            itemToGive,
            amountToGive
          )})\n` +
            `Nodoklis ko maksāt - **${latiString(totalTax)}** ` +
            `(${IEDOT_NODOKLIS * 100}% no mantu kopējās vērtības)\n` +
            `Tev ir ${latiString(lati)}`
        )
      );
    }

    if (amountToGive > targetUser.itemCap - countItems(targetUser.items)) {
      return i.reply(
        ephemeralReply(
          `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
            `<@${target.id}> inventārā ir tikai **${countFreeInvSlots(targetUser)}** brīvas vietas`
        )
      );
    }

    // murgs, 4 datubāzes saucieni :/
    await addLati(i.user.id, -totalTax);
    await addLati(i.client.user!.id, totalTax);
    await addItems(i.user.id, { [itemToGiveKey]: -amountToGive });
    const targetUserAfter = await addItems(target.id, { [itemToGiveKey]: amountToGive });

    if (!targetUserAfter) return i.reply(errorEmbed);

    const targetUserItem = targetUserAfter.items.find(({ name }) => name === itemToGiveKey)!;

    await i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description:
          `Tu iedevi <@${target.id}> ${itemString(itemToGive, amountToGive, true)}\n` +
          `Nodoklis: **${latiString(totalTax)}** (${
            IEDOT_NODOKLIS * 100
          }% no iedoto mantu kopējās vērtības)`,
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
