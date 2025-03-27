import { Message } from "discord.js";
import findAuctionById from "@/economy/auction/findAuctionById";
import smallEmbed from "@/embeds/smallEmbed";
import izsoleEmbed from "@/izsoles/izsoleEmbed";
import emoji from "@/utils/emoji";

export default async function izsolesMsgHandler(msg: Message, apiCommand: string, content: string[]) {
  if (!process.env.AUCTION_CHANNEL) return;

  const auctionChannel = msg.client.channels.cache.get(process.env.AUCTION_CHANNEL);
  if (!auctionChannel || !auctionChannel.isTextBased()) {
    return msg.reply(smallEmbed(`${emoji("icon_cross")} Izsoļu kanāls neeksistē`, 0xee0000));
  }

  switch (apiCommand) {
    case "auction-start": {
      const [id] = content;
      const auction = await findAuctionById(id);

      if (!auction) {
        return msg.reply(smallEmbed(`${emoji("icon_cross")} Izsole ar id \`${id}\` neeksistē`, 0xee0000));
      }

      try {
        await auctionChannel.send(izsoleEmbed(auction));
      } catch (e) {
        return msg.reply(
          smallEmbed(`${emoji("icon_cross")} Neizdevās aizsūtīt ziņu izsoles kanālā (${auctionChannel.id})`, 0xee0000),
        );
      }

      msg.reply(smallEmbed(`${emoji("icon_check1")} Izsole uzsākta veiksmīgi`, 0x00dd00));
    }
  }

  console.log(content);
}
