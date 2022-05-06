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
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  zemenu_rasens: {
    ids: ['rasens', 'zemenurasens', 'rasenu', 'zemenurasenu'],
    nameNomVsk: 'zemeņu Rasēns',
    nameNomDsk: 'zemeņu Rasēni',
    nameAkuVsk: 'zemeņu Rasēnu',
    nameAkuDsk: 'zemeņu Rasēnus',
    categories: [ItemCategory.VEIKALS],
    value: 75,
    use() {},
  },
};

export default itemList;