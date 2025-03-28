import velo, { veloInfo } from "@/items/shared/velo";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const velo_ramis = item<UsableItem>({
  info: veloInfo,
  addedInVersion: "4.0",
  nameNomVsk: "velosipēda rāmis",
  nameNomDsk: "velosipēda rāmji",
  nameAkuVsk: "velosipēda rāmi",
  nameAkuDsk: "velosipēda rāmjus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("velo_ramis"),
  imgLink: "https://www.ulmanbots.lv/images/items/velo_ramis.png",
  categories: [ItemCategory.OTHER],
  value: 10,
  use: velo,
});

export default velo_ramis;
