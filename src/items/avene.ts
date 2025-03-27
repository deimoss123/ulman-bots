import oga, { ogaInfo } from "@/items/shared/oga";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const avene = item<UsableItem>({
  info: ogaInfo("avene"),
  addedInVersion: "4.3",
  nameNomVsk: "avene",
  nameNomDsk: "avenes",
  nameAkuVsk: "aveni",
  nameAkuDsk: "avenes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("avene"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  removedOnUse: false,
  use: oga("avene"),
});

export default avene;
