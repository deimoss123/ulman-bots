import Item from '../interfaces/Item'

enum ShopCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS
}

export const itemList: Record<string, Item> = {
  pudele: {
    ids: ['pudele', 'stiklapudele', 'pudeli', 'stiklapudeli'],
    nameNomVsk: 'stikla pudele',
    nameNomDsk: 'stikla pudeles',
    nameAkuVsk: 'stikla pudeli',
    nameAkuDsk: 'stikla pudeles',
    categories: [ShopCategory.ATKRITUMI],
    value: 10,
  },
  latloto: {
    ids: ['latloto'],
    nameNomVsk: 'latloto biļete',
    nameNomDsk: 'latloto biļetes',
    nameAkuVsk: 'latloto biļeti',
    nameAkuDsk: 'latloto biļetes',
    categories: [ShopCategory.VEIKALS],
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
    categories: [ShopCategory.VEIKALS],
    value: 125,
    removedOnUse: true,
    use() {},
  },
}