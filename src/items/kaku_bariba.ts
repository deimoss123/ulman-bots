import { item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

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
  removedOnUse: false,
  use: () => ({
    text:
      `Tu pagaršoji kaķu barību (tā nebija garšīga)\n` +
      // @ts-ignore
      `Ar kaķu barību var pabarot **${itemString("kakis", null, true)}**`,
  }),
});

export default kaku_bariba;
