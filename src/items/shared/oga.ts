import itemString from "@/utils/strings/itemString";
import { UsableItemFunc } from "@/types/Item";
import { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import mainEmbed from "@/utils/embeds/mainEmbed";
import commandColors from "@/utils/commandColors";
import izmantotTitle from "@/utils/strings/izmantotTitle";

export type BerryProperties = {
  saldums: number;
  skabums: number;
  rugtums: number;
  slapjums: number;
};

export const propertiesLat: Record<keyof BerryProperties, string> = {
  saldums: "Saldums",
  skabums: "Skābums",
  rugtums: "Rūgtums",
  slapjums: "Slapjums",
};

export const berryProperties: Record<ItemKey, BerryProperties> = {
  avene: {
    saldums: 5,
    skabums: 3,
    rugtums: 7,
    slapjums: 2,
  },
  janoga: {
    saldums: 4,
    skabums: 7,
    rugtums: 9,
    slapjums: 1,
  },
  mellene: {
    saldums: 8,
    skabums: 6,
    rugtums: 4,
    slapjums: 9,
  },
  vinoga: {
    saldums: 1,
    skabums: 10,
    rugtums: 2,
    slapjums: 6,
  },
  zemene: {
    saldums: 9,
    skabums: 2,
    rugtums: 5,
    slapjums: 3,
  },
};

export function ogaInfo(key: ItemKey) {
  // te jāatgriež funkcija, jo citādāk bļauj par itemList importu
  // nav smuki, bet neko darīt
  return () =>
    `Ogas var iegūt no **${itemString("ogu_krums")}**\n` +
    `No ogām var vārīt **${itemString("ievarijums", null, true)}**, ` +
    `izmantojot **${itemString("gazes_plits", null, true)}**\n\n` +
    `Katrai ogai ir savas īpašības, kas ietekmē ievārījuma beigu cenu\n\n` +
    `**Šīs ogas īpašības:**\n` +
    Object.entries(berryProperties[key])
      .map(([key, value]) => `${propertiesLat[key as keyof BerryProperties]}: ${value}`)
      .join("\n");
}

const oga: UsableItemFunc = (i, _, itemKey) => {
  // prettier-ignore
  intReply(i, mainEmbed({ 
    i, 
    color: commandColors.izmantot, 
    title: izmantotTitle(itemKey),
    description: ogaInfo(itemKey)()
  }));
};

export default oga;
