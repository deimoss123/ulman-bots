import velo, { veloInfo } from "@/items/shared/velo";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const velo_sture = item<UsableItem>({
  info: veloInfo,
  addedInVersion: "4.0",
  nameNomVsk: "velosipēda stūre",
  nameNomDsk: "velosipēda stūres",
  nameAkuVsk: "velosipēda stūri",
  nameAkuDsk: "velosipēda stūres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("velo_sture"),
  imgLink: "https://www.ulmanbots.lv/images/items/velo_sture.png",
  categories: [ItemCategory.OTHER],
  value: 10,
  use: velo,
});

export default velo_sture;
