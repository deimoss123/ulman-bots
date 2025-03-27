import velo, { veloInfo } from "@/items/shared/velo";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const velo_kede = item<UsableItem>({
  info: veloInfo,
  addedInVersion: "4.0",
  nameNomVsk: "velosipēda ķēde",
  nameNomDsk: "velosipēda ķēdes",
  nameAkuVsk: "velosipēda ķēdi",
  nameAkuDsk: "velosipēda ķēdes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("velo_kede"),
  imgLink: "https://www.ulmanbots.lv/images/items/velo_kede.png",
  categories: [ItemCategory.OTHER],
  value: 10,
  removedOnUse: false,
  use: velo,
});

export default velo_kede;
