import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import AuctionType from '../../../interfaces/AuctionType';
import Auction from '../../../schemas/Auction';
import intReply from '../../../utils/intReply';
import { izsoleItemString } from './izsoleEmbeds';

export default async function izsoleList(i: ChatInputCommandInteraction) {
  let allIzsoles = (await Auction.find().catch(console.error)) as AuctionType[] | void;
  if (!allIzsoles) return intReply(i, errorEmbed);

  allIzsoles = JSON.parse(JSON.stringify(allIzsoles)) as AuctionType[];

  const fields: EmbedField[] = allIzsoles
    .sort((a, b) => a.startDate - b.startDate)
    .map((izsole, index) => ({
      name: `${index + 1}.`,
      value: izsoleItemString(izsole),
      inline: false,
    }));

  intReply(
    i,
    embedTemplate({
      i,
      title: 'Izsoļu saraksts',
      fields,
      color: 0xd18a38,
    })
  );
}
