import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
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
import { PIRKT_PARDOT_NODOKLIS } from '../pardot/pardot';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import setStats from '../../../economy/stats/setStats';
import getDiscounts from '../../../items/helpers/getDiscounts';
import intReply from '../../../utils/intReply';

export default async function pirktRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemToBuyKey: string,
  amountToBuy: number,
  embedColor: number
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const [user, discounts] = await Promise.all([findUser(userId, guildId), getDiscounts()]);
  if (!user || !discounts) return intReply(i, errorEmbed);

  const itemToBuy = itemList[itemToBuyKey];
  const totalCost = getItemPrice(itemToBuyKey, discounts).price * amountToBuy;

  if (totalCost > user.lati) {
    return intReply(
      i,
      ephemeralReply(
        `Tev nepietiek naudas lai nopirktu **${itemString(itemToBuy, amountToBuy, true)}**\n` +
          `Cena: ${latiString(totalCost)}\n` +
          `Tev ir ${latiString(user.lati)}`
      )
    );
  }

  const freeSlots = countFreeInvSlots(user);

  if (freeSlots < amountToBuy) {
    return intReply(
      i,
      ephemeralReply(
        `Tev nepietiek vietas inventārā lai nopirktu **${itemString(itemToBuy, amountToBuy, true)}**\n` +
          `Tev ir **${freeSlots}** brīvas vietas`
      )
    );
  }

  if ('attributes' in itemToBuy) {
    const checkRes = checkUserSpecialItems(user, itemToBuyKey, amountToBuy);
    if (!checkRes.valid) {
      return intReply(i, ephemeralReply(`Neizdevās nopirkt, jo ${checkRes.reason}`));
    }
  }

  const tax = Math.floor(totalCost * PIRKT_PARDOT_NODOKLIS);

  await Promise.all([
    addLati(i.client.user!.id, guildId, tax),
    addLati(userId, guildId, -totalCost),
    setStats(userId, guildId, { spentShop: totalCost, taxPaid: tax }),
  ]);

  const userAfter = await addItems(userId, guildId, { [itemToBuyKey]: amountToBuy });
  if (!userAfter) return intReply(i, errorEmbed);

  if ('attributes' in itemToBuy) {
    const resSpecialItems = userAfter.specialItems.filter(item => item.name === itemToBuyKey);

    return intReply(
      i,
      embedTemplate({
        i,
        title: 'Tu nopirki',
        description: `**${itemString(itemToBuy, amountToBuy, true)}** par ${totalCost} latiem`,
        color: embedColor,
        fields: [
          {
            name: 'Tev palika',
            value: latiString(userAfter.lati),
            inline: true,
          },
          {
            name: 'Tev tagad ir',
            value: itemString(itemToBuy, resSpecialItems.length),
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
    title: 'Tu nopirki',
    description: `**${itemString(itemToBuy, amountToBuy, true)}** ` + `par ${totalCost} latiem`,
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
    components: 'use' in itemToBuy ? [componentRow] : [],
  });

  const msg = await intReply(i, replyMessage);

  if (!msg || !('use' in itemToBuy)) return;

  buttonHandler(
    i,
    'pirkt',
    msg,
    async int => {
      if (int.customId === 'pirkt_izmantot') {
        if (int.componentType !== ComponentType.Button) return;

        let buttonStyle = ButtonStyle.Success;

        const userBeforeUse = await findUser(userId, guildId);
        if (!userBeforeUse) return { error: true };

        if (!userBeforeUse.items.find(item => item.name === itemToBuyKey)) {
          buttonStyle = ButtonStyle.Danger;
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
          after: () => izmantotRun(int, itemToBuyKey, embedColor),
        };
      }

      return;
    },
    10000
  );
}
