import { ButtonInteraction } from 'discord.js';
import findAuctionById from '../economy/auction/findAuctionById';
import errorEmbed from '../embeds/errorEmbed';
import intReply from '../utils/intReply';

export default async function handleIzsolesButtons(i: ButtonInteraction) {
  const [, auctionId, increaseAmount, totalAmount] = i.customId.split('-') as
    | [string, string, 'custom']
    | [string, string, '10' | '25', `${number}`];

  const auction = await findAuctionById(auctionId);
  if (!auction) return intReply(i, errorEmbed);

  if (increaseAmount === 'custom') {
    // TODO: modal
    return;
  }
}
