import { ButtonInteraction, RepliableInteraction } from "discord.js";
import { ItemKey } from "@/utils/itemList";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import { LotoOptions } from "@/items/shared/loto";
import { VersionString } from "@/commands/palidziba/jaunumi/updatesList";

export const enum ItemCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS,
  MAKSKERE,
  BRIVGRIEZIENS,
  TIRGUS,
  ADVENTE_2022,
  LOTO,
  OTHER,
}

// masīvs ar vismaz vienu vērtību
interface categories extends Array<ItemCategory> {
  0: ItemCategory;
  [key: number]: ItemCategory;
}

// prettier-ignore
export type UsableItemFunc = (
  i: RepliableInteraction, 
  user: UserProfile,
  itemKey: ItemKey,
) => Promise<any> | any;

export type UsableAttributeItemFunc = (
  i: RepliableInteraction,
  user: UserProfile,
  itemKey: ItemKey,
  specialItem: SpecialItemInProfile,
) => Promise<any> | any;

export interface BaseItem {
  // īss apraksts par mantu
  info?: string | (() => string);
  // kurā ulmaņbota versijā šī manta pievienota
  addedInVersion: VersionString;
  // nominatīvs vienskaitlis
  nameNomVsk: string;
  // nominatīvs daudzskaitlis
  nameNomDsk: string;
  // akuzatīvs vienskaitlis
  nameAkuVsk: string;
  // akuzatīvs daudzskaitlis
  nameAkuDsk: string;
  // vai ir vīriešu dzimtes lietvārds
  isVirsiesuDzimte: boolean;

  // emoji mantām
  emoji: () => string;

  // bildes links
  imgLink: string | null;
  // kategorijas - veikals, zivis utt
  categories: categories;
  // mantas vērtība
  value: number;
}

interface ShopCategories extends Array<ItemCategory> {
  0: ItemCategory.VEIKALS;
  [key: number]: ItemCategory;
}

export interface ShopItem {
  // vai ir atļautas atlaides
  allowDiscount?: boolean;
  categories: ShopCategories;
}

export interface LotoItem {
  lotoOptions: LotoOptions;
}

interface TirgusCategories extends Array<ItemCategory> {
  0: ItemCategory.TIRGUS;
  [key: number]: ItemCategory;
}
export interface TirgusItem {
  categories: TirgusCategories;
  // cena tirgum
  tirgusPrice: { items: Record<ItemKey, number>; lati?: number };
}

export interface UsableItem extends BaseItem {
  // ko manta darīs lietojot /izmantot komandu
  use: UsableItemFunc;
}

export type UseManyType = {
  // filtrs lai parādītu cik daudzi ir izmantojami
  filter: (attr: ItemAttributes) => boolean;
  // funkcija kas tiks palaista izmantojot vairākus
  runFunc: (i: ButtonInteraction) => any;
};

export interface AttributeItem<A extends Partial<ItemAttributes> = ItemAttributes> extends Omit<UsableItem, "use"> {
  // ko manta darīs lietojot /izmantot komandu
  use: UsableAttributeItemFunc;
  // noklusējuma mantu atribūti, piemēram kaķa vecums vai burkāna nosaukums
  defaultAttributes: (currTime: number) => A;
  // pēc kādiem atribūtiem kārtot mantas inventārā un izvēlnēs
  // 1 ir no lielākā uz mazāko, -1 ir no mazākā uz lielāko
  sortBy: Partial<Record<keyof A, 1 | -1>>;
  // speciāla vērtība, piem. makšķeres izturība ietekmē vērtību
  dynamicValue?: (attributes: A) => number;
  // speciāls emoji kas mainās atkarībā no atribūtiem
  dynamicEmoji?: (attributes: A) => string;
  // izmantot vairākus vienlaicīgi
  useMany?: UseManyType;
}

export interface NotSellableItem extends AttributeItem<ItemAttributes> {
  notSellable: true;
  value: 0;
}

type Item = BaseItem | UsableItem | AttributeItem<ItemAttributes> | NotSellableItem;

export const item: <T extends Item>(item: T) => T = (item) => item;

export default Item;
