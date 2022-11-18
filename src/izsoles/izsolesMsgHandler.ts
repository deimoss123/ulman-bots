import { Message } from 'discord.js';
import findAuctionById from '../economy/auction/findAuctionById';
import iconEmojis from '../embeds/iconEmojis';
import smallEmbed from '../embeds/smallEmbed';
import izsoleEmbed from './izsoleEmbed';

export default async function izsolesMsgHandler(msg: Message, apiCommand: string, content: string[]) {
  if (!process.env.AUCTION_CHANNEL) return;

  const auctionChannel = msg.client.channels.cache.get(process.env.AUCTION_CHANNEL);
  if (!auctionChannel || !auctionChannel.isTextBased()) {
    return msg.reply(smallEmbed(`${iconEmojis.cross} Izsoļu kanāls neeksistē`, 0xee0000));
  }

  switch (apiCommand) {
    case 'auction-start': {
      const [id] = content;
      const auction = await findAuctionById(id);

      if (!auction) {
        return msg.reply(smallEmbed(`${iconEmojis.cross} Izsole ar id \`${id}\` neeksistē`, 0xee0000));
      }

      try {
        await auctionChannel.send(izsoleEmbed(auction));
      } catch (e) {
        return msg.reply(
          smallEmbed(`${iconEmojis.cross} Neizdevās aizsūtīt ziņu izsoles kanālā (${auctionChannel.id})`, 0xee0000)
        );
      }

      msg.reply(smallEmbed(`${iconEmojis.checkmark} Izsole uzsākta veiksmīgi`, 0x00dd00));
    }
  }

  console.log(content);
}
