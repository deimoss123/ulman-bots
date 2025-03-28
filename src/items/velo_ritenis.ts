import velo, { veloInfo } from "@/items/shared/velo";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const velo_ritenis = item<UsableItem>({
  info: veloInfo,
  addedInVersion: "4.0",
  nameNomVsk: "velosipēda ritenis",
  nameNomDsk: "velosipēda riteņi",
  nameAkuVsk: "velosipēda riteni",
  nameAkuDsk: "velosipēda riteņus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("velo_ritenis"),
  imgLink: "https://www.ulmanbots.lv/images/items/velo_ritenis.png",
  categories: [ItemCategory.OTHER],
  value: 10,
  use: velo,
});

export default velo_ritenis;
