import oga, { ogaInfo } from "@/items/shared/oga";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const mellene = item<UsableItem>({
  info: ogaInfo("mellene"),
  addedInVersion: "4.3",
  nameNomVsk: "mellene",
  nameNomDsk: "mellenes",
  nameAkuVsk: "melleni",
  nameAkuDsk: "mellenes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("mellene"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  use: oga,
});

export default mellene;
