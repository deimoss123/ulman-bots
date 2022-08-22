import Item from '../interfaces/Item';
import virve from './usableItems/virve';
import divainais_burkans from './usableItems/divainais_burkans';
import mugursoma from './usableItems/mugursoma';
import latloto from './usableItems/latloto';
import dizloto from './usableItems/dizloto';
import kafija from './usableItems/kafija';
import kafijas_aparats from './usableItems/kafijas_aparats';

export type ItemKey = string;

export enum ItemCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS,
}

const itemList: Record<ItemKey, Item> = {
  koka_makskere: {
    nameNomVsk: 'koka makšķere',
    nameNomDsk: 'koka makšķeres',
    nameAkuVsk: 'koka makšķeri',
    nameAkuDsk: 'koka makšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557004651601931',
      name: 'kokamakskere',
    },
    categories: [ItemCategory.VEIKALS],
    value: 100,
    allowDiscount: true,
    // use() {},
  },
  latloto: {
    nameNomVsk: 'latloto biļete',
    nameNomDsk: 'latloto biļetes',
    nameAkuVsk: 'latloto biļeti',
    nameAkuDsk: 'latloto biļetes',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557006098645062',
      name: 'latloto',
    },
    categories: [ItemCategory.VEIKALS],
    value: 50,
    removedOnUse: true,
    use: latloto,
  },
  nazis: {
    nameNomVsk: 'nazis',
    nameNomDsk: 'naži',
    nameAkuVsk: 'nazi',
    nameAkuDsk: 'nažus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557010305531944',
      name: 'nazis',
    },
    categories: [ItemCategory.VEIKALS],
    value: 125,
    removedOnUse: true,
    allowDiscount: true,
    // use() {},
  },
  pudele: {
    nameNomVsk: 'stikla pudele',
    nameNomDsk: 'stikla pudeles',
    nameAkuVsk: 'stikla pudeli',
    nameAkuDsk: 'stikla pudeles',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557011526074438',
      name: 'pudele',
    },
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  virve: {
    nameNomVsk: 'virve',
    nameNomDsk: 'virves',
    nameAkuVsk: 'virvi',
    nameAkuDsk: 'virves',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557012855652453',
      name: 'virve',
    },
    categories: [ItemCategory.VEIKALS, ItemCategory.ATKRITUMI],
    value: 10,
    allowDiscount: true,
    removedOnUse: true,
    use: virve,
  },
  zemenu_rasens: {
    nameNomVsk: 'zemeņu Rasēns',
    nameNomDsk: 'zemeņu Rasēni',
    nameAkuVsk: 'zemeņu Rasēnu',
    nameAkuDsk: 'zemeņu Rasēnus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557014143324190',
      name: 'zemenu_rasens',
    },
    categories: [ItemCategory.VEIKALS],
    value: 75,
    allowDiscount: true,
    removedOnUse: true,
    // use() {},
  },
  metalluznis: {
    nameNomVsk: 'metāllūznis',
    nameNomDsk: 'metāllūžņi',
    nameAkuVsk: 'metāllūzni',
    nameAkuDsk: 'metāllūžņus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557007424040970',
      name: 'metalluznis',
    },
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  divainais_burkans: {
    nameNomVsk: 'dīvainais burkāns',
    nameNomDsk: 'dīvainie burkāni',
    nameAkuVsk: 'dīvaino burkānu',
    nameAkuDsk: 'dīvainos burkānus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1011108345312186439',
      name: 'divainais_burkans',
      animated: true,
    },
    categories: [ItemCategory.VEIKALS],
    value: 5000,
    attributes: {
      timesUsed: 0,
      customName: '',
    },
    allowDiscount: true,
    use: divainais_burkans,
  },
  dizloto: {
    nameNomVsk: 'dižloto biļete',
    nameNomDsk: 'dižloto biļetes',
    nameAkuVsk: 'dižloto biļeti',
    nameAkuDsk: 'dižloto biļetes',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009556999840747570',
      name: 'dizloto',
    },
    categories: [ItemCategory.VEIKALS],
    value: 250,
    removedOnUse: true,
    use: dizloto,
  },
  divaina_makskere: {
    nameNomVsk: 'dīvainā makšķere',
    nameNomDsk: 'dīvainās makšķeres',
    nameAkuVsk: 'dīvaino makšķeri',
    nameAkuDsk: 'dīvainās makšķeres',
    isVirsiesuDzimte: false,
    emoji: null,
    categories: [ItemCategory.VEIKALS],
    value: 500,
    allowDiscount: true,
    // use:
  },
  mugursoma: {
    nameNomVsk: 'mugursoma',
    nameNomDsk: 'mugursomas',
    nameAkuVsk: 'mugursomu',
    nameAkuDsk: 'mugursomas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557008850092059',
      name: 'mugursoma',
    },
    categories: [ItemCategory.VEIKALS],
    value: 1500,
    allowDiscount: true,
    removedOnUse: true,
    use: mugursoma,
  },
  kartona_kaste: {
    nameNomVsk: 'kartona kaste',
    nameNomDsk: 'kartona kastes',
    nameAkuVsk: 'kartona kasti',
    nameAkuDsk: 'kartona kastes',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557002667687958',
      name: 'kartona_kaste',
    },
    categories: [ItemCategory.ATKRITUMI],
    value: 15,
  },
  kafija: {
    nameNomVsk: 'kafija',
    nameNomDsk: 'kafijas',
    nameAkuVsk: 'kafiju',
    nameAkuDsk: 'kafijas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557001451356161',
      name: 'kafija',
    },
    categories: [ItemCategory.VEIKALS],
    value: 50,
    allowDiscount: true,
    removedOnUse: false,
    use: kafija,
  },
  kafijas_aparats: {
    nameNomVsk: 'kafijas aparāts',
    nameNomDsk: 'kafijas aparāti',
    nameAkuVsk: 'kafijas aparātu',
    nameAkuDsk: 'kafijas aparātus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1011300411191341139',
      name: 'kafijas_aparats',
    },
    categories: [ItemCategory.VEIKALS],
    value: 100,
    attributes: {
      lastUsed: 0,
    },
    allowDiscount: false,
    removedOnUse: false,
    use: kafijas_aparats,
  },
};

export default itemList;
