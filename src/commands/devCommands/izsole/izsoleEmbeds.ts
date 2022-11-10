import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  time,
} from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import AuctionType from '../../../interfaces/AuctionType';
import { ItemAttributes } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';

const izsoleConfirmComponents = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder().setCustomId('izsole_create_yes').setLabel('Jā').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('izsole_create_no').setLabel('Nē').setStyle(ButtonStyle.Danger)
);

export function confirmNewIzsoleMsg(
  i: ChatInputCommandInteraction,
  itemKey: ItemKey,
  itemAmount: number,
  attributes: ItemAttributes | null,
  startPrice: number,
  startDate: number,
  endDate: number
): InteractionReplyOptions & { fetchReply: true } {
  return embedTemplate({
    i,
    title: 'Izveidot jaunu izsoli?',
    description:
      `Manta: **${itemString(itemList[itemKey], itemAmount)}**\n` +
      (attributes
        ? `${Object.entries(attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}\n`
        : '') +
      `\nSākuma cena: ${latiString(startPrice, false, true)}\n\n` +
      `No: **${time(new Date(startDate), 't')}** ${time(new Date(startDate), 'd')}\n` +
      `Līdz: **${time(new Date(endDate), 't')}** ${time(new Date(endDate), 'd')}`,
    color: 0xffffff,
    components: [izsoleConfirmComponents],
  });
}

export function izsoleItemString({
  _id,
  itemKey,
  itemAmount,
  startPrice,
  attributes,
  startDate,
  endDate,
}: AuctionType) {
  return (
    `Id: \`${_id}\`\n` +
    `**${itemString(itemList[itemKey], itemAmount)}**\n` +
    (attributes
      ? `${Object.entries(attributes)
          .filter(([key]) => key !== '_id')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}\n`
      : '') +
    `\nSākuma cena: ${latiString(startPrice, false, true)}\n` +
    `No: **${time(new Date(startDate), 't')}** ${time(new Date(startDate), 'd')}\n` +
    `Līdz: **${time(new Date(endDate), 't')}** ${time(new Date(endDate), 'd')}`
  );
}
