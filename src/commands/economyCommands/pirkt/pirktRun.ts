import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageButtonStyle,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import addLati from '../../../economy/addLati';
import addItems from '../../../economy/addItems';
import embedTemplate from '../../../embeds/embedTemplate';
import itemList from '../../../items/itemList';
import buttonHandler from '../../../embeds/buttonHandler';
import izmantotRun from '../izmantot/izmantotRun';
import getItemPrice from '../../../items/helpers/getItemPrice';

export default async function pirktRun(
  i: CommandInteraction | ButtonInteraction,
  itemToBuyKey: string,
  amountToBuy: number,
  embedColor: string,
): Promise<void> {
  const user = await findUser(i.user.id);
  if (!user) {
    await i.reply(errorEmbed);
    return;
  }

  const itemToBuy = itemList[itemToBuyKey];

  // mantu cena ir tā vērtība reiz 2
  const totalCost = getItemPrice(itemToBuyKey).price * amountToBuy;

  if (totalCost > user.lati) {
    await i.reply(ephemeralReply(
      `Tev nepietiek naudas lai nopirktu ${itemString(itemToBuy, amountToBuy, true)}\n` +
      `Cena: ${latiString(totalCost)}\n` +
      `Tev ir ${latiString(user.lati)}`,
    ));
    return;
  }

  const freeSlots = countFreeInvSlots(user);

  if (freeSlots < amountToBuy) {
    await i.reply(ephemeralReply(
      `Tev nepietiek vietas inventārā lai nopirktu ${itemString(itemToBuy, amountToBuy, true)}\n` +
      `Tev ir **${freeSlots}** brīvas vietas`,
    ));
    return;
  }

  await addLati(i.user.id, -totalCost);
  const userAfter = await addItems(i.user.id, { [itemToBuyKey]: amountToBuy });

  if (!userAfter) {
    await i.reply(errorEmbed);
    return;
  }

  const resItems = userAfter.items.find(item => item.name === itemToBuyKey)!;

  const componentRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setCustomId('pirkt_izmantot')
    .setLabel(`Izmantot (${resItems.amount})`)
    .setStyle('PRIMARY'));

  const replyMessage = embedTemplate({
    i,
    description:
      `Tu nopirki **${itemString(itemToBuy, amountToBuy, true)}** ` +
      `un iztērēji ${latiString(totalCost, true)}`,
    color: embedColor,
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
    components: itemToBuy.use ? [componentRow] : [],
  });

  const interactionReply = await i.reply(replyMessage);

  if (!itemToBuy.use) return;

  await buttonHandler(i, 'pirkt', interactionReply!, async componentInteraction => {
    if (componentInteraction.customId === 'pirkt_izmantot') {
      if (componentInteraction.componentType !== 'BUTTON') return;

      let buttonStyle = 'SUCCESS';

      const userBeforeUse = await findUser(i.user.id);
      if (userBeforeUse) {
        if (!userBeforeUse.items.find(item => item.name === itemToBuyKey)) {
          buttonStyle = 'DANGER';
        }
      }

      componentRow.setComponents(
        new MessageButton()
        .setCustomId('pirkt_izmantot')
        .setLabel(`Izmantot (${resItems.amount})`)
        .setStyle(buttonStyle as MessageButtonStyle)
        .setDisabled(true),
      );

      return {
        end: true,
        edit: { components: [componentRow] },
        after: async () => izmantotRun(componentInteraction, itemToBuyKey, embedColor),
      };
    }

    return;
  }, 10000);

}