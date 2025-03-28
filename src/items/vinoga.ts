import oga, { ogaInfo } from "@/items/shared/oga";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const vinoga = item<UsableItem>({
  info: ogaInfo("vinoga"),
  addedInVersion: "4.3",
  nameNomVsk: "vīnoga",
  nameNomDsk: "vīnogas",
  nameAkuVsk: "vīnogu",
  nameAkuDsk: "vīnogas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("vinoga"),
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  use: oga,
});

export default vinoga;
