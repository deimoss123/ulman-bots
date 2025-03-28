import { item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";

// XD smieklīgs nosaukums
const kaku_bariba = item<UsableItem & ShopItem>({
  info: () =>
    `Iecienītas brokastis, pusdienas un vakariņas (kaķim)\n` +
    // @ts-ignore
    `Ar kaķu barību var pabarot **${itemString("kakis", null, true)}**`,
  addedInVersion: "4.1",
  nameNomVsk: "kaķu barība",
  nameNomDsk: "kaķu barības",
  nameAkuVsk: "kaķu barību",
  nameAkuDsk: "kaķu barības",
  isVirsiesuDzimte: false,
  emoji: () => emoji("kaku_bariba"),
  imgLink: "https://www.ulmanbots.lv/images/items/kaku_bariba.png",
  categories: [ItemCategory.VEIKALS],
  value: 20,
  allowDiscount: true,
  use: (i) => {
    // prettier-ignore
    intReply(i, mainEmbed({ 
      i, 
      color: commandColors.izmantot, 
      title: izmantotTitle('kaku_bariba'),
      description:
        `Tu pagaršoji kaķu barību (tā nebija garšīga)\n` +
        `Ar kaķu barību var pabarot **${itemString("kakis", null, true)}**`,
    }));
  },
});

export default kaku_bariba;
