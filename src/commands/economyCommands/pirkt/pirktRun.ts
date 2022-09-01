import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
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
  embedColor: number
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return i.reply(errorEmbed);

  const itemToBuy = itemList[itemToBuyKey];

  // mantu cena ir tā vērtība reiz 2
  const totalCost = getItemPrice(itemToBuyKey).price * amountToBuy;

  if (totalCost > user.lati) {
    return i.reply(
      ephemeralReply(
        `Tev nepietiek naudas lai nopirktu ${itemString(itemToBuy, amountToBuy, true)}\n` +
          `Cena: ${latiString(totalCost)}\n` +
          `Tev ir ${latiString(user.lati)}`
      )
    );
  }

  const freeSlots = countFreeInvSlots(user);

  if (freeSlots < amountToBuy) {
    return i.reply(
      ephemeralReply(
        `Tev nepietiek vietas inventārā lai nopirktu ${itemString(
          itemToBuy,
          amountToBuy,
          true
        )}\n` + `Tev ir **${freeSlots}** brīvas vietas`
      )
    );
  }

  await addLati(userId, guildId, -totalCost);
  const userAfter = await addItems(userId, guildId, { [itemToBuyKey]: amountToBuy });

  if (!userAfter) return i.reply(errorEmbed);

  if (itemToBuy.attributes) {
    const resSpecialItems = userAfter.specialItems.filter(item => item.name === itemToBuyKey);

    return i.reply(
      embedTemplate({
        i,
        description:
          `Tu nopirki **${itemString(itemToBuy, amountToBuy, true)}** ` + `par ${totalCost} latiem`,
        color: embedColor,
        fields: [
          {
            name: 'Tev palika',
            value: latiString(userAfter.lati),
            inline: true,
          },
          {
            name: 'Tev tagad ir',
            value: itemString(itemList[itemToBuyKey], resSpecialItems.length),
            inline: true,
          },
        ],
      })
    );
  }

  const resItems = userAfter.items.find(item => item.name === itemToBuyKey)!;

  const componentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('pirkt_izmantot')
      .setLabel(`Izmantot (${resItems.amount})`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(itemToBuy.emoji || { name: '❓' })
  );

  const replyMessage = embedTemplate({
    i,
    description:
      `Tu nopirki **${itemString(itemToBuy, amountToBuy, true)}** ` + `par ${totalCost} latiem`,
    color: embedColor,
    fields: [
      {
        name: 'Tev palika',
        value: latiString(userAfter.lati),
        inline: true,
      },
      {
        name: 'Tev tagad ir',
        value: itemString(itemList[resItems.name], resItems.amount),
        inline: true,
      },
    ],
    components: itemToBuy.use ? [componentRow] : [],
  });

  const interactionReply = await i.reply(replyMessage);

  if (!itemToBuy.use) return;

  await buttonHandler(
    i,
    'pirkt',
    interactionReply!,
    async componentInteraction => {
      if (componentInteraction.customId === 'pirkt_izmantot') {
        if (componentInteraction.componentType !== ComponentType.Button) return;

        let buttonStyle = ButtonStyle.Success;

        const userBeforeUse = await findUser(userId, guildId);
        if (userBeforeUse) {
          if (!userBeforeUse.items.find(item => item.name === itemToBuyKey)) {
            buttonStyle = ButtonStyle.Danger;
          }
        }

        componentRow.setComponents(
          new ButtonBuilder()
            .setCustomId('pirkt_izmantot')
            .setLabel(`Izmantot (${resItems.amount})`)
            .setStyle(buttonStyle)
            .setEmoji(itemToBuy.emoji || { name: '❓' })
            .setDisabled(true)
        );

        return {
          end: true,
          edit: { components: [componentRow] },
          after: async () => izmantotRun(componentInteraction, itemToBuyKey, embedColor),
        };
      }

      return;
    },
    10000
  );
}
