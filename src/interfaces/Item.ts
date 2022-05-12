// masīvs ar vismaz vienu vērtību
interface ids extends Array<string> {
  0: string;
  [key: number]: string;
}

interface categories extends Array<number> {
  0: number;
  [key: number]: number;
}

interface Item {
  // mantu id ko izmanto komandās, piemēram /pirkt <id>
  ids: ids;

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

  // kategorijas - veikals, zivis utt
  categories: categories;

  // mantas vērtība
  value: number;

  // vai lietojot mantu tā tiks noņemta no inventāra
  removedOnUse?: boolean;

  // ko manta darīs lietojot /izmantot komandu
  use?: () => void;
}

export default Item;