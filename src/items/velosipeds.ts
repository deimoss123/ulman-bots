import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const velosipeds = item<BaseItem>({
  info:
    "Šis velosipēds nav braucošā stāvoklī, bet vismaz tu to vari pārdot!\n\n" +
    "Velosipēdu var iegūt to sataisot ar velosipēda detaļām (rāmis, riteņi, ķēde un stūre)",
  addedInVersion: "4.0",
  nameNomVsk: "velosipēds",
  nameNomDsk: "velosipēdi",
  nameAkuVsk: "velosipēdu",
  nameAkuDsk: "velosipēdus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("velosipeds"),
  imgLink: "https://www.ulmanbots.lv/images/items/velosipeds.png",
  categories: [ItemCategory.OTHER],
  value: 250,
});

export default velosipeds;
