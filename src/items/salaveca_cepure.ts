import { item, UsableItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";

const salaveca_cepure = item<UsableItem>({
  info: () =>
    `Salaveča cepuri var uzvilkt:\n` +
    ["petnieks", "kakis"].map((key) => `• **${itemString(key)}**\n`).join("") +
    `\nUzvelkot cepuri mainīsies mantas izskats (emoji), uzvilkt cepuri var izmantojot mantu kurai vēlies to uzvilkt`,
  addedInVersion: "4.2",
  nameNomVsk: "salaveča cepure",
  nameNomDsk: "salaveča cepures",
  nameAkuVsk: "salaveča cepuri",
  nameAkuDsk: "salaveča cepures",
  isVirsiesuDzimte: false,
  emoji: () => emoji("salaveca_cepure"),
  imgLink: "https://www.ulmanbots.lv/images/items/salaveca_cepure.png",
  categories: [ItemCategory.ADVENTE_2022],
  value: 75,
  // eslint-disable-next-line func-names
  use: function (i) {
    // prettier-ignore
    intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("salaveca_cepure"),
      // @ts-ignore
      description: this.info(),
    }));
  },
});

export default salaveca_cepure;
