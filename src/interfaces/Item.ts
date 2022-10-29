import { APIMessageComponentEmoji } from 'discord.js';
import { ItemKey } from '../items/itemList';
import UsableItemReturn from './UsableItemReturn';
import { ItemAttributes, SpecialItemInProfile } from './UserProfile';

// masīvs ar vismaz vienu vērtību
interface categories extends Array<number> {
  0: number;
  [key: number]: number;
}

export type UsableItemFunc = (
  userId: string,
  guildId: string,
  itemKey: ItemKey,
  specialItem?: SpecialItemInProfile
) => Promise<UsableItemReturn>;

interface Item {
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

  // emoji priekš mantas, piem. <:virve:922501450544857098>
  emoji: APIMessageComponentEmoji | null;

  // bildes links
  imgLink: string | null;

  // kategorijas - veikals, zivis utt
  categories: categories;

  // mantas vērtība
  value: number;

  // speciāla vērtība, piem. makšķeres izturība ietekmē vērtību
  customValue?: (attributes: ItemAttributes) => number;

  // cena priekš tirgus
  tirgusPrice?: { items: Record<ItemKey, number>; lati?: number };

  // mantu atribūtas, piem., cik reizes lietots, cik izturība, utt.
  // norāda noklusējuma daudzumu
  attributes?: ItemAttributes;

  // vai ir atļautas atlaides
  allowDiscount?: boolean;

  // vai lietojot mantu tā tiks noņemta no inventāra
  removedOnUse?: boolean;

  // ko manta darīs lietojot /izmantot komandu
  use?: UsableItemFunc;
}

export default Item;
