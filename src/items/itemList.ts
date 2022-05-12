import Item from '../interfaces/Item';

export enum ItemCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS
}

const itemList: Record<string, Item> = {
  koka_makskere: {
    ids: ['makskere', 'makskeri'],
    nameNomVsk: 'koka makšķere',
    nameNomDsk: 'koka makšķeres',
    nameAkuVsk: 'koka makšķeri',
    nameAkuDsk: 'koka makšķeres',
    isVirsiesuDzimte: false,
    categories: [ItemCategory.VEIKALS],
    value: 100,
    use() {},
  },
  latloto: {
    ids: ['latloto'],
    nameNomVsk: 'latloto biļete',
    nameNomDsk: 'latloto biļetes',
    nameAkuVsk: 'latloto biļeti',
    nameAkuDsk: 'latloto biļetes',
    isVirsiesuDzimte: true,
    categories: [ItemCategory.VEIKALS],
    value: 50,
    removedOnUse: true,
    use() {},
  },
  nazis: {
    ids: ['nazis', 'nazi'],
    nameNomVsk: 'nazis',
    nameNomDsk: 'naži',
    nameAkuVsk: 'nazi',
    nameAkuDsk: 'nažus',
    isVirsiesuDzimte: true,
    categories: [ItemCategory.VEIKALS],
    value: 125,
    removedOnUse: true,
    use() {},
  },
  pudele: {
    ids: ['pudele', 'stiklapudele', 'pudeli', 'stiklapudeli'],
    nameNomVsk: 'stikla pudele',
    nameNomDsk: 'stikla pudeles',
    nameAkuVsk: 'stikla pudeli',
    nameAkuDsk: 'stikla pudeles',
    isVirsiesuDzimte: false,
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  virve: {
    ids: ['virve', 'virvi'],
    nameNomVsk: 'virve',
    nameNomDsk: 'virves',
    nameAkuVsk: 'virvi',
    nameAkuDsk: 'virves',
    isVirsiesuDzimte: false,
    categories: [ItemCategory.VEIKALS, ItemCategory.ATKRITUMI],
    value: 10,
  },
  zemenu_rasens: {
    ids: ['rasens', 'zemenurasens', 'rasenu', 'zemenurasenu'],
    nameNomVsk: 'zemeņu Rasēns',
    nameNomDsk: 'zemeņu Rasēni',
    nameAkuVsk: 'zemeņu Rasēnu',
    nameAkuDsk: 'zemeņu Rasēnus',
    isVirsiesuDzimte: true,
    categories: [ItemCategory.VEIKALS],
    value: 75,
    use() {},
  },
  metalluznis: {
    ids: ['metalluznis', 'metalluzni', 'metalluznus'],
    nameNomVsk: 'metāllūznis',
    nameNomDsk: 'metāllūžņi',
    nameAkuVsk: 'metāllūzni',
    nameAkuDsk: 'metāllūžņus',
    isVirsiesuDzimte: true,
    categories: [ItemCategory.ATKRITUMI],
    value: 5,
  }
};

export default itemList;