import Command from '../../interfaces/Command';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { CommandInteraction } from 'discord.js';
import findItemById from '../../items/findItemById';
import ephemeralReply from '../../embeds/ephemeralReply';
import itemList, { ItemCategory } from '../../items/itemList';
import capitalizeFirst from '../../embeds/stringFunctions/capitalizeFirst';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/stringFunctions/itemString';
import latiString from '../../embeds/stringFunctions/latiString';
import countFreeInvSlots from '../../items/countFreeInvSlots';
import embedTemplate from '../../embeds/embedTemplate';
import addLati from '../../economy/addLati';
import addItems from '../../economy/addItems';
import wrongIdEmbed from '../../embeds/wrongIdEmbed';

const pirkt: Command = {
  title: 'Pirkt',
  description: 'Pirkt preci no veikala',
  config: {
    name: 'pirkt',
    description: 'Nopirkt preci no veikala',
    options: [
      {
        name: 'preces_id',
        description: 'Preces id',
        type: ApplicationCommandOptionTypes.STRING,
        required: true,
      }, {
        name: 'daudzums',
        description: 'Cik preces pirkt (ja neievadi tad būs 1)',
        type: ApplicationCommandOptionTypes.INTEGER,
        min_value: 1,
      },
    ],
  },
  async run(i: CommandInteraction) {
    const itemToBuyId = i.options.data[0].value as string;
    const amount = i.options.data[1]?.value as number ?? 1;

    const itemToBuy = findItemById(itemToBuyId);
    if (!itemToBuy) {
      await i.reply(wrongIdEmbed(itemToBuyId));
      return;
    }

    if (!itemToBuy.item.categories.includes(ItemCategory.VEIKALS)) {
      await i.reply(ephemeralReply(
        `**${capitalizeFirst(itemList[itemToBuy.key].nameNomVsk)}** nav nopērkams veikalā`,
      ));
      return;
    }

    const user = await findUser(i.guildId!, i.user.id);
    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    // mantu cena ir tā vērtība reiz 2
    const totalCost = amount * itemToBuy.item.value * 2;

    if (totalCost > user.lati) {
      await i.reply(ephemeralReply(
        `Tev nepietiek naudas lai nopirktu ${itemString(itemToBuy.item, amount, true)}\n` +
        `Cena: ${latiString(totalCost)}\n` +
        `Tev ir ${latiString(user.lati)}`,
      ));
      return;
    }

    const freeSlots = countFreeInvSlots(user);

    console.log(freeSlots);

    if (freeSlots < amount) {
      await i.reply(ephemeralReply(
        `Tev nepietiek vietas inventārā lai nopirktu ${itemString(itemToBuy.item, amount, true)}\n` +
        `Tev ir **${freeSlots}** brīvas vietas`,
      ));
      return;
    }

    let userAfter = await addLati(i.guildId!, i.user.id, -totalCost);
    userAfter = await addItems(i.guildId!, i.user.id, { [itemToBuy.key]: amount });
    if (!userAfter) {
      await i.reply(errorEmbed);
      return;
    }

    const resItems = userAfter.items.find(item => item.name === itemToBuy.key)!;

    await i.reply(embedTemplate({
      i,
      description:
        `Tu nopirki **${itemString(itemToBuy.item, amount, true)}** ` +
        `un iztērēji ${latiString(totalCost, true)}`,
      fields: [
        {
          name: 'Tev palika',
          value: latiString(userAfter.lati),
          inline: true,
        }, {
          name: 'Tev tagad ir',
          value: itemString(itemList[resItems.name], resItems.amount),
          inline: true,
        },
      ],
    }));
  },
};

export default pirkt;