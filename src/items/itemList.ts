import Item from '../interfaces/Item';
import virve from './usableItems/virve';
import divainais_burkans from './usableItems/divainais_burkans';
import mugursoma from './usableItems/mugursoma';
import latloto from './usableItems/latloto';
import dizloto from './usableItems/dizloto';

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
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  virve: {
    nameNomVsk: 'virve',
    nameNomDsk: 'virves',
    nameAkuVsk: 'virvi',
    nameAkuDsk: 'virves',
    isVirsiesuDzimte: false,
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
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  divainais_burkans: {
    nameNomVsk: 'dīvainais burkāns',
    nameNomDsk: 'dīvainie burkāni',
    nameAkuVsk: 'dīvaino burkānu',
    nameAkuDsk: 'dīvainos burkānus',
    isVirsiesuDzimte: true,
    categories: [ItemCategory.VEIKALS],
    value: 5000,
    allowDiscount: true,
    use: divainais_burkans,
  },
  dizloto: {
    nameNomVsk: 'dižloto biļete',
    nameNomDsk: 'dižloto biļetes',
    nameAkuVsk: 'dižloto biļeti',
    nameAkuDsk: 'dižloto biļetes',
    isVirsiesuDzimte: false,
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
    categories: [ItemCategory.ATKRITUMI],
    value: 15,
  },
};

export default itemList;
