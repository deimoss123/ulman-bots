import { item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const granulas = item<UsableItem & ShopItem>({
  info: () => `TODO`,
  addedInVersion: "4.3",
  nameNomVsk: "granulas",
  nameNomDsk: "granulas",
  nameAkuVsk: "granulas",
  nameAkuDsk: "granulas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("granulas"),
  imgLink: null,
  categories: [ItemCategory.VEIKALS],
  value: 1,
  allowDiscount: true,
  removedOnUse: false,
  use: () => ({
    text: `GRANULAS`,
  }),
});

export default granulas;
