import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const asaris = item<BaseItem>({
  info: "Šī zivs novedīs tevi līdz asarām",
  addedInVersion: "4.0",
  nameNomVsk: "asaris",
  nameNomDsk: "asari",
  nameAkuVsk: "asari",
  nameAkuDsk: "asarus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("asaris"),
  imgLink: "https://www.ulmanbots.lv/images/items/asaris.png",
  categories: [ItemCategory.ZIVIS],
  value: 15,
});

export default asaris;
