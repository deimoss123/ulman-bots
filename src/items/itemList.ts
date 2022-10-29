import Item from '../interfaces/Item';
import virve from './usableItems/virve';
import divainais_burkans from './usableItems/divainais_burkans';
import mugursoma, { INCREASE_CAP_1, INV_INCREASE_AMOUNT_1 } from './usableItems/mugursoma';
import latloto from './usableItems/latloto';
import dizloto from './usableItems/dizloto';
import kafija from './usableItems/kafija';
import kafijas_aparats from './usableItems/kafijas_aparats';
import velo, { veloInfo } from './usableItems/velo';
import divaina_mugursoma, { INCREASE_CAP_2, INV_NCREASE_AMOUNT_2 } from './usableItems/divaina_mugursoma';
import petnieks from './usableItems/petnieks';
import juridiska_zivs, { JURIDISKA_ZIVS_STATUS } from './usableItems/juridiska_zivs';
import maksekeresData from '../commands/economyCommands/zvejot/makskeresData';
import makskere, { makskereCustomValue } from './usableItems/makskere';
import naudas_maiss from './usableItems/naudas_maiss';
import brivgrieziens, { brivgriezInfo } from './usableItems/brivgrieziens';
import smilsu_pulkstenis, { ZVEJA_SHIFT_TIME } from './usableItems/smilsu_pulkstenis';
import nazis, { NAZIS_STATUS_TIME } from './usableItems/nazis';
import zemenu_rasens, { RASENS_STATUS_TIME } from './usableItems/zemenu_rasens';
import { statusList } from '../commands/economyCommands/profils';
import millisToReadableTime from '../embeds/helpers/millisToReadableTime';
import piena_spainis from './usableItems/piena_spainis';
import divaina_zivs from './usableItems/divaina_zivs';
import loto_zivs from './usableItems/loto_zivs';
import petniekzivs, { PETNIEKZIVS_STATUS_TIME } from './usableItems/petniekzivs';
import kakis, { foodDataPercentage, kakisFedState, kakisFoodData, KAKIS_MAX_FEED } from './usableItems/kakis';
import itemString from '../embeds/helpers/itemString';

export type ItemKey = string;

export enum ItemCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS,
  MAKSKERE,
  BRIVGRIEZIENS,
  TIRGUS,
  OTHER,
}

const itemList: Record<ItemKey, Item> = {
  // -- veikals --
  koka_makskere: {
    info: 'Izcila maksķere iesācēju zvejotājiem - lēta un vienmēr pieejama.',
    nameNomVsk: 'koka makšķere',
    nameNomDsk: 'koka makšķeres',
    nameAkuVsk: 'koka makšķeri',
    nameAkuDsk: 'koka makšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557004651601931',
      name: 'kokamakskere',
    },
    imgLink: 'https://i.postimg.cc/wBnfqzy2/kokamakskere.png',
    categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
    value: 100,
    customValue: makskereCustomValue('koka_makskere'),
    attributes: {
      durability: maksekeresData.koka_makskere.maxDurability,
    },
    allowDiscount: true,
    use: makskere,
  },
  latloto: {
    info: 'Lētākā loterijas biļete kas nopērkama veikalā,\npārbaudi savu veiksmi jau šodien!',
    nameNomVsk: 'latloto biļete',
    nameNomDsk: 'latloto biļetes',
    nameAkuVsk: 'latloto biļeti',
    nameAkuDsk: 'latloto biļetes',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557006098645062',
      name: 'latloto',
    },
    imgLink: 'https://i.postimg.cc/SKYdtPTM/latloto.png',
    categories: [ItemCategory.VEIKALS],
    value: 50,
    removedOnUse: true,
    use: latloto,
  },
  nazis: {
    info:
      'Ja jūties viltīgs un ar vēlmi zagt, tad nazis ir priekš tevis.\n' +
      `Izmantojot nazi tu iegūsi **"${statusList.laupitajs}"** statusu uz ` +
      `\`${millisToReadableTime(NAZIS_STATUS_TIME)}\``,
    nameNomVsk: 'nazis',
    nameNomDsk: 'naži',
    nameAkuVsk: 'nazi',
    nameAkuDsk: 'nažus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557010305531944',
      name: 'nazis',
    },
    imgLink: 'https://i.postimg.cc/DZqg7XKf/nazis.png',
    categories: [ItemCategory.VEIKALS],
    value: 125,
    removedOnUse: true,
    allowDiscount: true,
    use: nazis,
  },
  virve: {
    info: 'Nopērc virvi, ja vienkārši vairs nevari izturēt...\nVirvi izmantot nav ieteicams.',
    nameNomVsk: 'virve',
    nameNomDsk: 'virves',
    nameAkuVsk: 'virvi',
    nameAkuDsk: 'virves',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557012855652453',
      name: 'virve',
    },
    imgLink: 'https://i.postimg.cc/rmCSB2SK/virve.png',
    categories: [ItemCategory.VEIKALS],
    value: 10,
    allowDiscount: true,
    removedOnUse: true,
    use: virve,
  },
  zemenu_rasens: {
    info:
      'Ja tev riebjas nolādētie zagļi kas visu laiku no tevis zog, izdzer zemeņu Rasēnu\n' +
      'Izdzerot (izmantojot) rasenu tu iegūsi ' +
      `**"${statusList.aizsargats}"** statusu uz \`${millisToReadableTime(RASENS_STATUS_TIME)}\``,
    nameNomVsk: 'zemeņu Rasēns',
    nameNomDsk: 'zemeņu Rasēni',
    nameAkuVsk: 'zemeņu Rasēnu',
    nameAkuDsk: 'zemeņu Rasēnus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1009557014143324190',
      name: 'zemenu_rasens',
    },
    imgLink: 'https://i.postimg.cc/Vsgq41fh/zemenu-rasens.png',
    categories: [ItemCategory.VEIKALS],
    value: 75,
    allowDiscount: true,
    removedOnUse: true,
    use: zemenu_rasens,
  },
  divainais_burkans: {
    info:
      'Šis burkāns ir ne tikai dīvains, bet arī garšīgs!\n' +
      'Burkānam piemīt atrībuts, kas uzskaita cik reizes tas ir bijis nokosts (izmantots)\n\n' +
      '_burkānam piemīt vēlviens atribūts, par kuru uzzinās tikai tie kas to ir nopirkuši_',
    nameNomVsk: 'dīvainais burkāns',
    nameNomDsk: 'dīvainie burkāni',
    nameAkuVsk: 'dīvaino burkānu',
    nameAkuDsk: 'dīvainos burkānus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029745787850194994',
      name: 'divainais_burkans',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/vHRJytjW/divainais-burkans.gif',
    categories: [ItemCategory.VEIKALS],
    value: 5000,
    // eslint-disable-next-line func-names
    customValue: function ({ customName }) {
      // humors
      if (customName!.toLowerCase().includes('seks')) return 6969;

      // pārbauda kirilicu
      if (/[а-яА-ЯЁё]/.test(customName!)) return 0;

      return this.value;
    },
    attributes: {
      timesUsed: 0,
      customName: '',
    },
    allowDiscount: true,
    use: divainais_burkans,
  },
  dizloto: {
    info:
      'Ja tev ir apnicis skrāpēt Latloto biļetes un vēlies palielināt savas likmes, ' +
      'tad pārbaudi savu veiksmi ar Dižloto jau šodien!\n',
    nameNomVsk: 'dižloto biļete',
    nameNomDsk: 'dižloto biļetes',
    nameAkuVsk: 'dižloto biļeti',
    nameAkuDsk: 'dižloto biļetes',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029738364875837500',
      name: 'dizloto',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/vZbCgHGT/dizloto.gif',
    categories: [ItemCategory.VEIKALS],
    value: 250,
    removedOnUse: true,
    use: dizloto,
  },
  divaina_makskere: {
    info:
      'Koka makšķere ir pārāk lēna?\nTā pārāk bieži lūzt?\nNenes pietiekami lielu pelņu?\n' +
      'Tad ir laiks investēt dīvainajā maksķerē!!!',
    nameNomVsk: 'dīvainā makšķere',
    nameNomDsk: 'dīvainās makšķeres',
    nameAkuVsk: 'dīvaino makšķeri',
    nameAkuDsk: 'dīvainās makšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029750421624979548',
      name: 'divaina_makskere',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/bJ80z0dr/divaina-makskere.gif',
    categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
    value: 450,
    customValue: makskereCustomValue('divaina_makskere'),
    attributes: {
      durability: maksekeresData.divaina_makskere.maxDurability,
    },
    allowDiscount: true,
    use: makskere,
  },
  mugursoma: {
    info:
      'Inventārs pilns, ||bikses pilnas,|| ko tagad darīt?\n' +
      `Mugursoma palielinās tava inventāra ietilpību par **${INV_INCREASE_AMOUNT_1}** (līdz **${INCREASE_CAP_1}** vietām)`,
    nameNomVsk: 'mugursoma',
    nameNomDsk: 'mugursomas',
    nameAkuVsk: 'mugursomu',
    nameAkuDsk: 'mugursomas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557008850092059',
      name: 'mugursoma',
    },
    imgLink: 'https://i.postimg.cc/YChzhVws/mugursoma.png',
    categories: [ItemCategory.VEIKALS],
    value: 250,
    allowDiscount: true,
    removedOnUse: false,
    use: mugursoma,
  },
  piena_spainis: {
    info: 'Izdzerot (izmantojot) šo gardo piena spaini tev tiks noņemti visi statusi',
    nameNomVsk: 'piena spainis',
    nameNomDsk: 'piena spaiņi',
    nameAkuVsk: 'piena spaini',
    nameAkuDsk: 'piena spaiņus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1030251381350748201',
      name: 'piena_spainis',
    },
    imgLink: 'https://i.postimg.cc/D0B8X05s/piena-spainis.png',
    categories: [ItemCategory.VEIKALS],
    value: 25,
    allowDiscount: true,
    removedOnUse: false,
    use: piena_spainis,
  },

  // -- tirgus --
  divaina_mugursoma: {
    info:
      `Tu esi izmantojis parastās mugursomas un sasniedzis ${INCREASE_CAP_1} vietas inventārā\n` +
      `Ar dīvaino mugursomu tu vari palielināt inventāra iepilpību par **${INV_NCREASE_AMOUNT_2}** (līdz **${INCREASE_CAP_2}** vietām)`,
    nameNomVsk: 'dīvainā mugursoma',
    nameNomDsk: 'dīvainās mugursomas',
    nameAkuVsk: 'dīvaino mugursomu',
    nameAkuDsk: 'dīvainās mugursomas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029772502542594089',
      name: 'divaina_mugursoma',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/v8kxDGSf/divaina-mugursoma.gif',
    categories: [ItemCategory.TIRGUS],
    tirgusPrice: { items: { mugursoma: 3 } },
    value: 500,
    allowDiscount: true,
    removedOnUse: false,
    use: divaina_mugursoma,
  },
  kafijas_aparats: {
    info:
      `Kafijas aparāts ik \`24h\` uztaisīs kafiju, kuru var iegūt kafijas aparātu izmantojot\n\n` +
      '_Nevienam vēljoprojām nav zināms kā šis kafijas aparāts ir spējīgs bezgalīgi taisīt kafiju bez pupiņām, vai ūdens, vai ... elektrības_',
    nameNomVsk: 'kafijas aparāts',
    nameNomDsk: 'kafijas aparāti',
    nameAkuVsk: 'kafijas aparātu',
    nameAkuDsk: 'kafijas aparātus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1011300411191341139',
      name: 'kafijas_aparats',
    },
    imgLink: 'https://i.postimg.cc/CLwvLm13/kafijas-aparats.png',
    categories: [ItemCategory.TIRGUS],
    value: 200,
    tirgusPrice: { items: { kafija: 15, metalluznis: 3 } },
    attributes: {
      lastUsed: 0,
    },
    removedOnUse: false,
    use: kafijas_aparats,
  },
  petnieks: {
    info:
      `Pētnieks vēlās kļūt par tavu labāko draugu!\n` +
      `Viņš ir tik draudzīgs, ka priekš tevis pētīs krievu mājaslapas lai atrastu brīvgriezienus\n\n` +
      'Pētnieks atrod vienu brīvgriezienu ik `12h`, kuru tu vari saņemt pētnieku "izmantojot"',
    nameNomVsk: 'pētnieks',
    nameNomDsk: 'pētnieki',
    nameAkuVsk: 'pētnieku',
    nameAkuDsk: 'pētniekus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029800146638213160',
      name: 'petnieks',
    },
    imgLink: 'https://i.postimg.cc/D0JW5NmS/petnieks.png',
    categories: [ItemCategory.TIRGUS],
    value: 300,
    tirgusPrice: { items: { brivgriez25: 6, brivgriez50: 4, brivgriez100: 2 }, lati: 750 },
    attributes: {
      lastUsed: 0,
      foundItemKey: '',
    },
    removedOnUse: false,
    use: petnieks,
  },
  loto_makskere: {
    info:
      'Šī makšķere ir īpaši veidota tieši priekš azartspēļu atkarības cietušajiem\n' +
      'Iegādājies to, ja nevari atturēties no aparāta un loto biļetēm',
    nameNomVsk: 'loto makšķere',
    nameNomDsk: 'loto makšķeres',
    nameAkuVsk: 'loto makšķeri',
    nameAkuDsk: 'loto makšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029752905470849105',
      name: 'loto_makskere',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/pTZfy9nZ/loto-makskere.gif',
    categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
    value: 500,
    customValue: makskereCustomValue('loto_makskere'),
    tirgusPrice: { items: { latloto: 3, dizloto: 2, brivgriez25: 2, brivgriez50: 1 } },
    attributes: {
      durability: maksekeresData.loto_makskere.maxDurability,
    },
    removedOnUse: false,
    use: makskere,
  },
  luznu_makskere: {
    info:
      'Ja mīlēsi metāllūžņus, tie visnotaļ mīlēs arī tevi!\n' +
      'Par cik šī makšķere knapi turās kopā, to nav iespējams salabot',
    nameNomVsk: 'lūžņu makšķere',
    nameNomDsk: 'lūžņu makšķeres',
    nameAkuVsk: 'lūžņu makšķeri',
    nameAkuDsk: 'lūžņu makšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1028069745251057684',
      name: 'luznu_makskere',
    },
    imgLink: 'https://i.postimg.cc/kGsvbP4k/luznu-makskere.png',
    categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
    value: 100,
    customValue: makskereCustomValue('luznu_makskere'),
    tirgusPrice: { items: { metalluznis: 15 } },
    attributes: {
      durability: maksekeresData.luznu_makskere.maxDurability,
    },
    removedOnUse: false,
    use: makskere,
  },
  naudas_maiss: {
    info:
      'Kļūt par bankas zagli ir viegli, bet kur liksi nolaupīto naudu?\n\n' +
      'Naudas maiss glabā no Valsts Bankas (UlmaņBota) nozagto naudu, ' +
      'un lai zagtu no bankas inventārā ir jābūt vismaz vienam **tukšam** naudas maisam',
    nameNomVsk: 'naudas maiss',
    nameNomDsk: 'naudas maisi',
    nameAkuVsk: 'naudas maisu',
    nameAkuDsk: 'naudas maisus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029800143832240148',
      name: 'naudas_maiss',
    },
    imgLink: 'https://i.postimg.cc/prwmSBnq/naudas-maiss.png',
    categories: [ItemCategory.TIRGUS],
    value: 10,
    // eslint-disable-next-line func-names
    customValue: function ({ latiCollected }) {
      return latiCollected || this.value;
    },
    tirgusPrice: { items: { nazis: 1, zemenu_rasens: 1, juridiska_zivs: 1, divaina_zivs: 1 } },
    attributes: {
      latiCollected: 0,
    },
    removedOnUse: false,
    use: naudas_maiss,
  },
  kakis: {
    info: () =>
      '**Pūkains, stilīgs un episks!**\n\n' +
      `Kaķim ir 2 atribūti - vecums un garastāvoklis\n` +
      `Kaķis ir jābaro citādāk tas nomirs\n\n` +
      '__Kaķim ir 6 garastāvokļi:__ \n' +
      kakisFedState
        .map(({ time, name }) => `• **${name}** (${Math.floor((time / KAKIS_MAX_FEED) * 100)}%)`)
        .join('\n') +
      `\n\nKaķa garastāvoklis tiek mērīts procentos (100% ir **\`${millisToReadableTime(KAKIS_MAX_FEED)}\`**) ` +
      `un ar laiku tas samazināsies, kad tiek sasniegti 0% kaķis **NOMIRS**\n\n` +
      `Lai uzlabotu kaķa garastāvokli tas ir jābaro, to var izdarīt kaķi "izmantojot"\n\n` +
      '__Kaķi ir iespājms pabarot ar šīm mantām:__\n' +
      Object.entries(kakisFoodData)
        .sort(([, a], [, b]) => b.feedTimeMs - a.feedTimeMs)
        // @ts-ignore
        .map(([key]) => `**${itemString(this.default[key])}** ${foodDataPercentage(key)}`)
        .join('\n') +
      '\n\n_**Paldies Ričardam par šo izcilo kaķa bildi (viņu sauc Sāra)**_',
    nameNomVsk: 'kaķis',
    nameNomDsk: 'kaķi',
    nameAkuVsk: 'kaķi',
    nameAkuDsk: 'kaķus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1032294560816173136',
      name: 'kakis',
    },
    imgLink: 'https://i.postimg.cc/xTyhJzcJ/kakis.png',
    categories: [ItemCategory.TIRGUS],
    value: 100,
    tirgusPrice: { items: { lidaka: 3, asaris: 3, lasis: 3 } },
    attributes: {
      customName: '',
      createdAt: 0,
      fedUntil: 0,
    },
    removedOnUse: false,
    use: kakis,
  },

  // -- atkritumi --
  kartona_kaste: {
    info: 'Kāds šeit iekšā ir dzīvojis...',
    nameNomVsk: 'kartona kaste',
    nameNomDsk: 'kartona kastes',
    nameAkuVsk: 'kartona kasti',
    nameAkuDsk: 'kartona kastes',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557002667687958',
      name: 'kartona_kaste',
    },
    imgLink: 'https://i.postimg.cc/WzwXwJ9Y/kartona-kaste.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 15,
  },
  pudele: {
    info:
      'Šī tik tiešām ir skaista pudele kuru varētu nodot depozīta sistēmā!\n' +
      'Cik žēl, ka taromāts šajā UlmaņBota versijā neeksistē... :^)',
    nameNomVsk: 'stikla pudele',
    nameNomDsk: 'stikla pudeles',
    nameAkuVsk: 'stikla pudeli',
    nameAkuDsk: 'stikla pudeles',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557011526074438',
      name: 'pudele',
    },
    imgLink: 'https://i.postimg.cc/L43T7LTN/pudele.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },
  metalluznis: {
    info:
      'Vai tu esi redzējis skaistāku metāla gabalu par šo?!?!??!!\n\n' +
      'Metāllūžņi ir iekļauti dažās tirgus preču cenās, apdomā vai tik tiešām vēlies tos pārdot',
    nameNomVsk: 'metāllūznis',
    nameNomDsk: 'metāllūžņi',
    nameAkuVsk: 'metāllūzni',
    nameAkuDsk: 'metāllūžņus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1030251422614306946',
      name: 'metalluznis',
    },
    imgLink: 'https://i.postimg.cc/B6KgnnCY/metalluznis.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  },

  // -- zivis --
  lidaka: {
    info: 'Uz šo zivi skatīties nav ieteicams kamēr esi darbā...',
    nameNomVsk: 'līdaka',
    nameNomDsk: 'līdakas',
    nameAkuVsk: 'līdaku',
    nameAkuDsk: 'līdakas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1028069743988588586',
      name: 'lidaka',
    },
    imgLink: 'https://i.postimg.cc/4N45Ty2Z/lidaka.png',
    categories: [ItemCategory.ZIVIS],
    value: 10,
  },
  asaris: {
    info: 'Šī zivs novedīs tevi līdz asarām',
    nameNomVsk: 'asaris',
    nameNomDsk: 'asari',
    nameAkuVsk: 'asari',
    nameAkuDsk: 'asarus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1028069739890757753',
      name: 'asaris',
    },
    imgLink: 'https://i.postimg.cc/VvmFvkYq/asaris.png',
    categories: [ItemCategory.ZIVIS],
    value: 15,
  },
  lasis: {
    info: 'Tu labprāt šo zivi apēstu, bet nejaukais Discord čatbots tev to neļauj darīt',
    nameNomVsk: 'lasis',
    nameNomDsk: 'laši',
    nameAkuVsk: 'lasi',
    nameAkuDsk: 'lašus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1028069742558314526',
      name: 'lasis',
    },
    imgLink: 'https://i.postimg.cc/yYnLJc3k/lasis.png',
    categories: [ItemCategory.ZIVIS],
    value: 20,
  },
  loto_zivs: {
    info:
      'Uzgriez loto zivi un kā laimestu saņem... zivis\n' +
      'Loto zivij piemīt atribūts "Satur **x** zivis", kas nosaka cik zivis no loto zivs ir iespējams laimēt',
    nameNomVsk: 'loto zivs',
    nameNomDsk: 'loto zivis',
    nameAkuVsk: 'loto zivi',
    nameAkuDsk: 'loto zivis',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1032050670225866762',
      name: 'loto_zivs',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/2j22b78L/loto-zivs.gif',
    categories: [ItemCategory.ZIVIS],
    value: 0,
    customValue: ({ holdsFishCount }) => holdsFishCount! * 10,
    attributes: {
      holdsFishCount: 0,
    },
    removedOnUse: false,
    use: loto_zivs,
  },
  juridiska_zivs: {
    info:
      'Šai zivij pieder vairāki multimiljonu uzņēmumi\n\n' +
      `Apēdot (izmantojot) juridisko zivi tu iegūsi ` +
      `**"${statusList.juridisks}"** statusu uz \`${millisToReadableTime(JURIDISKA_ZIVS_STATUS)}\`, ` +
      `kas tevi atvieglos no iedošanas un maksāšanas nodokļa\n\n` +
      '_Tikai neapēd šīs zivs dārgo uzvalku_',
    nameNomVsk: 'juridiskā zivs',
    nameNomDsk: 'juridiskās zivis',
    nameAkuVsk: 'juridisko zivi',
    nameAkuDsk: 'juridiskās zivis',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1028069741287440486',
      name: 'juridiska_zivs',
    },
    imgLink: 'https://i.postimg.cc/g2QqRDzk/juridiska-zivs.png',
    categories: [ItemCategory.ZIVIS],
    value: 50,
    removedOnUse: true,
    use: juridiska_zivs,
  },
  divaina_zivs: {
    info: 'Šī zivs garšo nedaudz _dīvaini_, apēd (izmanto) to lai iegūtu vienu nejauši izvēlētu statusu',
    nameNomVsk: 'dīvainā zivs',
    nameNomDsk: 'dīvainās zivis',
    nameAkuVsk: 'dīvaino zivi',
    nameAkuDsk: 'dīvainās zivis',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029789643073388585',
      name: 'divaina_zivs',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/2SfqF2Y5/divaina-zivs.gif',
    categories: [ItemCategory.ZIVIS],
    value: 60,
    removedOnUse: true,
    use: divaina_zivs,
  },
  petniekzivs: {
    info:
      '__**Šodien paveiksies!**__\n\n' +
      `Apēdot (izmantojot) šo zivi tu saņemsi statusu **"${statusList.veiksmigs}"** ` +
      `uz \`${millisToReadableTime(PETNIEKZIVS_STATUS_TIME)}\`, ` +
      `kas palielina feniksa, ruletes un loto biļešu procentus`,
    nameNomVsk: 'pētniekzivs',
    nameNomDsk: 'pētniekzivis',
    nameAkuVsk: 'pētniekzivi',
    nameAkuDsk: 'pētniekzivis',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1032281289245601822',
      name: 'petniekzivs',
    },
    imgLink: 'https://i.postimg.cc/pTDhDc2f/petniekzivs.png',
    categories: [ItemCategory.ZIVIS],
    value: 40,
    removedOnUse: true,
    use: petniekzivs,
  },

  // -- velosipēds --
  velosipeds: {
    info:
      'Šis velosipēds nav braucošā stāvoklī, bet vismaz tu to vari pārdot!\n\n' +
      'Velosipēdu var iegūt to sataisot ar velosipēda detaļām (rāmis, riteņi, ķēde un stūre)',
    nameNomVsk: 'velosipēds',
    nameNomDsk: 'velosipēdi',
    nameAkuVsk: 'velosipēdu',
    nameAkuDsk: 'velosipēdus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1028069751563489320',
      name: 'velosipeds',
    },
    imgLink: 'https://i.postimg.cc/sxT52PHz/velosipeds.png',
    categories: [ItemCategory.OTHER],
    value: 250,
  },
  velo_ramis: {
    info: veloInfo,
    nameNomVsk: 'velosipēda rāmis',
    nameNomDsk: 'velosipēda rāmji',
    nameAkuVsk: 'velosipēda rāmi',
    nameAkuDsk: 'velosipēda rāmjus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1028069747297894512',
      name: 'velo_ramis',
    },
    imgLink: 'https://i.postimg.cc/DyCcfhRG/velo-ramis.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    use: velo,
  },
  velo_ritenis: {
    info: veloInfo,
    nameNomVsk: 'velosipēda ritenis',
    nameNomDsk: 'velosipēda riteņi',
    nameAkuVsk: 'velosipēda riteni',
    nameAkuDsk: 'velosipēda riteņus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1028069749038534766',
      name: 'velo_ritenis',
    },
    imgLink: 'https://i.postimg.cc/zvzn52jp/velo-ritenis.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    use: velo,
  },
  velo_kede: {
    info: veloInfo,
    nameNomVsk: 'velosipēda ķēde',
    nameNomDsk: 'velosipēda ķēdes',
    nameAkuVsk: 'velosipēda ķēdi',
    nameAkuDsk: 'velosipēda ķēdes',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1028069746509348904',
      name: 'velo_kede',
    },
    imgLink: 'https://i.postimg.cc/JnWNYzHf/velo-kede.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    use: velo,
  },
  velo_sture: {
    info: veloInfo,
    nameNomVsk: 'velosipēda stūre',
    nameNomDsk: 'velosipēda stūres',
    nameAkuVsk: 'velosipēda stūri',
    nameAkuDsk: 'velosipēda stūres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1028069750317789224',
      name: 'velo_sture',
    },
    imgLink: 'https://i.postimg.cc/tg6dzxJd/velo-sture.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    use: velo,
  },

  // -- citas mantas --
  kafija: {
    info:
      `Strādāt ir grūti ja esi noguris, izdzer kafiju!\n\n` +
      'Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n' +
      'Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz',
    nameNomVsk: 'kafija',
    nameNomDsk: 'kafijas',
    nameAkuVsk: 'kafiju',
    nameAkuDsk: 'kafijas',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1009557001451356161',
      name: 'kafija',
    },
    imgLink: 'https://i.postimg.cc/SQ6ThwyL/kafija.png',
    categories: [ItemCategory.OTHER],
    value: 30,
    allowDiscount: true,
    removedOnUse: false,
    use: kafija,
  },
  dizmakskere: {
    info:
      'UlmaņBota veidotājs rakstot šo aprakstu aizmirsa kāpēc dižmakšķere eksistē...\n\n' +
      'Dižmakšķere var nocopēt tikai un vienīgi vērtīgas mantas, tajā skaitā visas mantas kas nopērkamas tirgū\n',
    nameNomVsk: 'dižmakšķere',
    nameNomDsk: 'dižmakšķeres',
    nameAkuVsk: 'dižmakšķeri',
    nameAkuDsk: 'dižmakšķeres',
    isVirsiesuDzimte: false,
    emoji: {
      id: '1029758877752897569',
      name: 'dizmakskere',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/Xq55MQ0p/dizmakskere.gif',
    categories: [ItemCategory.MAKSKERE],
    value: 500,
    customValue: makskereCustomValue('dizmakskere'),
    attributes: {
      durability: maksekeresData.dizmakskere.maxDurability,
    },
    use: makskere,
  },
  smilsu_pulkstenis: {
    info:
      'Izmantojot smilšu pulksteni zvejošanas laiks maģiski tiks pārbīdīts uz priekšu ' +
      `par \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
    nameNomVsk: 'smilšu pulkstenis',
    nameNomDsk: 'smilšu pulksteņi',
    nameAkuVsk: 'smilšu pulksteni',
    nameAkuDsk: 'smilšu pulksteņus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029770674056745062',
      name: 'smilsu_pulkstenis',
      animated: true,
    },
    imgLink: 'https://i.postimg.cc/LX0YtS4d/smilsu-pulkstenis.gif',
    categories: [ItemCategory.OTHER],
    value: 75,
    removedOnUse: false,
    use: smilsu_pulkstenis,
  },

  // -- brīvgriezieni --
  brivgriez10: {
    info: brivgriezInfo,
    nameNomVsk: '10 latu brīvgrieziens',
    nameNomDsk: '10 latu brīvgriezieni',
    nameAkuVsk: '10 latu brīvgriezienu',
    nameAkuDsk: '10 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029728226571993088',
      name: 'brivgriez10',
    },
    imgLink: 'https://i.postimg.cc/SxgVZ5sr/brivgriez10.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 2,
    removedOnUse: false,
    use: brivgrieziens(10),
  },
  brivgriez25: {
    info: brivgriezInfo,
    nameNomVsk: '25 latu brīvgrieziens',
    nameNomDsk: '25 latu brīvgriezieni',
    nameAkuVsk: '25 latu brīvgriezienu',
    nameAkuDsk: '25 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029729516584701982',
      name: 'brivgriez25',
    },
    imgLink: 'https://i.postimg.cc/d0D6gBZK/brivgriez25.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 5,
    removedOnUse: false,
    use: brivgrieziens(25),
  },
  brivgriez50: {
    info: brivgriezInfo,
    nameNomVsk: '50 latu brīvgrieziens',
    nameNomDsk: '50 latu brīvgriezieni',
    nameAkuVsk: '50 latu brīvgriezienu',
    nameAkuDsk: '50 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029730465189482577',
      name: 'brivgriez50',
    },
    imgLink: 'https://i.postimg.cc/1X1Kn1C9/brivgriez50.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 10,
    removedOnUse: false,
    use: brivgrieziens(50),
  },
  brivgriez100: {
    info: brivgriezInfo,
    nameNomVsk: '100 latu brīvgrieziens',
    nameNomDsk: '100 latu brīvgriezieni',
    nameAkuVsk: '100 latu brīvgriezienu',
    nameAkuDsk: '100 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: {
      id: '1029731216968122378',
      name: 'brivgriez100',
    },
    imgLink: 'https://i.postimg.cc/R08dmHwJ/brivgriez100.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 20,
    removedOnUse: false,
    use: brivgrieziens(100),
  },
};

export default itemList;
