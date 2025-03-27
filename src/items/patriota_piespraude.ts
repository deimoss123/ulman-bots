import { item, AttributeItem, NotSellableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

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
  sortBy: { piespraudeNum: 1 },
  use: () => ({ text: "chau" }),
});

export default patriota_piespraude;
