import oga, { ogaInfo } from "@/items/shared/oga";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const zemene = item<UsableItem>({
  info: ogaInfo("zemene"),
  addedInVersion: "4.3",
  nameNomVsk: "zemene",
  nameNomDsk: "zemenes",
  nameAkuVsk: "zemeni",
  nameAkuDsk: "zemenes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("zemene"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  removedOnUse: false,
  use: oga("zemene"),
});

export default zemene;
