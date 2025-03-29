import { item, AttributeItem, NotSellableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import wrapString from "@/utils/strings/wrapString";

const patriota_piespraude = item<AttributeItem<{ piespraudeNum: number }> & NotSellableItem>({
  info: "...",
  addedInVersion: "4.3",
  nameNomVsk: "patriotu piespraude",
  nameNomDsk: "patriotu piespraudes",
  nameAkuVsk: "patriotu piespraudi",
  nameAkuDsk: "patriotu piespraudes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("piespraude"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 0,
  notSellable: true,
  defaultAttributes: () => ({
    piespraudeNum: 0,
  }),
  displayAttributes: ({ piespraudeNum }, inline) => wrapString(`Nr. ${piespraudeNum}`, "**", !inline),
  sortBy: (attrA, attrB) => (attrA.piespraudeNum ?? 0) - (attrB.piespraudeNum ?? 0),
  use: (i) => intReply(i, "..."),
});

export default patriota_piespraude;
