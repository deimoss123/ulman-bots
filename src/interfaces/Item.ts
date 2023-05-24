import { APIMessageComponentEmoji, ButtonInteraction } from 'discord.js';
import { ItemCategory, ItemKey } from '../items/itemList';
import UsableItemReturn from './UsableItemReturn';
import { ItemAttributes, SpecialItemInProfile } from './UserProfile';
import { LotoOptions } from '../items/usableItems/loto';

// masīvs ar vismaz vienu vērtību
interface categories extends Array<ItemCategory> {
  0: ItemCategory;
  [key: number]: ItemCategory;
}

export type UsableItemFunc = (
  userId: string,
  guildId: string,
  itemKey: ItemKey,
  specialItem?: SpecialItemInProfile
) => Promise<UsableItemReturn> | UsableItemReturn;

export interface BaseItem {
  // īss apraksts par mantu
  info?: string | (() => string);
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
  // emoji mantām, piem. <:virve:922501450544857098>
  emoji: APIMessageComponentEmoji | null;
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
  // vai lietojot mantu tā tiks noņemta no inventāra
  removedOnUse: boolean;
  // ko manta darīs lietojot /izmantot komandu
  use: UsableItemFunc;
}

export type UseManyType = {
  // filtrs lai parādītu cik daudzi ir izmantojami
  filter: (attr: ItemAttributes) => boolean;
  // funkcija kas tiks palaista izmantojot vairākus
  runFunc: (i: ButtonInteraction) => any;
};

export interface AttributeItem extends Omit<UsableItem, 'removedOnUse'> {
  // mantu atribūti, piemēram kaķa vecums vai burkāna nosaukums
  attributes: ItemAttributes;
  // pēc kādiem atribūtiem kārtot mantas inventārā un izvēlnēs
  // 1 ir no lielākā uz mazāko, -1 ir no mazākā uz lielāko
  sortBy: Partial<Record<keyof ItemAttributes, 1 | -1>>;
  // speciāla vērtība, piem. makšķeres izturība ietekmē vērtību
  customValue?: (attributes: ItemAttributes) => number;
  // speciāls emoji kas mainās atkarībā no atribūtiem
  customEmoji?: (attributes: ItemAttributes) => APIMessageComponentEmoji;
  // izmantot vairākus vienlaicīgi
  useMany?: UseManyType;
}

export interface NotSellableItem extends AttributeItem {
  notSellable: true;
  value: 0;
}

type Item = BaseItem | UsableItem | AttributeItem | NotSellableItem;

export const item: <T extends Item>(item: T) => T = item => item;

export default Item;
