import UsableItemReturn from './UsableItemReturn';

// masīvs ar vismaz vienu vērtību
interface categories extends Array<number> {
  0: number;
  [key: number]: number;
}

interface Item {
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
  emoji: string | null;

  // kategorijas - veikals, zivis utt
  categories: categories;

  // mantas vērtība
  value: number;

  // vai ir atļautas atlaides
  allowDiscount?: boolean;

  // vai lietojot mantu tā tiks noņemta no inventāra
  removedOnUse?: boolean;

  // ko manta darīs lietojot /izmantot komandu
  use?: (userId: string) => Promise<UsableItemReturn>;
}

export default Item;
