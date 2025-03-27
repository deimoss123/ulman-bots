import oga, { ogaInfo } from "@/items/shared/oga";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const janoga = item<UsableItem>({
  info: ogaInfo("janoga"),
  addedInVersion: "4.3",
  nameNomVsk: "jāņoga",
  nameNomDsk: "jāņogas",
  nameAkuVsk: "jāņogu",
  nameAkuDsk: "jāņogas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("janoga"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  removedOnUse: false,
  use: oga("janoga"),
});

export default janoga;
