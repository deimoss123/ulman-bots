import maksekeresData from '../../commands/economyCommands/zvejot/makskeresData';
import { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import itemList, { ItemCategory, ItemKey } from '../../items/itemList';
import { cookableItems } from '../../items/usableItems/gazes_plits';
import { KAFIJAS_APARATS_COOLDOWN } from '../../items/usableItems/kafijas_aparats';
import { kakisFedState } from '../../items/usableItems/kakis';
import { PETNIEKS_COOLDOWN } from '../../items/usableItems/petnieks';
import capitalizeFirst from './capitalizeFirst';
import itemString, { makeEmojiString } from './itemString';
import latiString from './latiString';
import millisToReadableTime from './millisToReadableTime';
import { dabutOguInfo, dabutKrumaInfo } from '../../items/usableItems/ogu_krums';

const hiddenAttributes: Partial<keyof ItemAttributes>[] = [
  'customName',
  'foundItemKey',
  'fedUntil',
  'isCooked',
  'hat',
  'cookingStartedTime',
  'berryType',
  'maxBerries',
  'growthTime',
  'iestadits',
  'apliets',
  'apliesanasReizes',
];

export function displayAttributes(item: SpecialItemInProfile, inline = false, prefix = '') {
  const currTime = Date.now();

  const attributesLat: Record<
    string,
    Partial<Record<keyof ItemAttributes, (n: number, attributes: ItemAttributes) => string>>
  > = {
    divainais_burkans: {
      timesUsed: n =>
        `Nokosts ${inline ? '' : '**'}${n}${inline ? '' : '**'} ` +
        `reiz${n % 10 === 1 && n % 100 !== 11 ? 'i' : 'es'}`,
    },
    kafijas_aparats: {
      lastUsed: n =>
        currTime - n >= KAFIJAS_APARATS_COOLDOWN
          ? `${inline ? '' : '**'}Kafija gatava!${inline ? '' : '**'}`
          : `Gatavo: ${inline ? '' : '`'}` +
            millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - currTime + n) +
            (inline ? '' : '`'),
    },
    petnieks: {
      lastUsed: (n, { foundItemKey, hat }) =>
        (currTime - n >= PETNIEKS_COOLDOWN
          ? `${inline ? '' : '**'}Nopētījis:${inline ? '' : '**'} ` +
            (inline ? itemList[foundItemKey!].nameAkuVsk : makeEmojiString(itemList[foundItemKey!].emoji!))
          : `Pēta: ${inline ? '' : '`'}` +
            `${millisToReadableTime(PETNIEKS_COOLDOWN - currTime + n)}` +
            (inline ? '' : '`')) +
        (hat
          ? `${inline ? ', ' : '\n'}Cepure: ` +
            (inline ? capitalizeFirst(itemList[hat].nameNomVsk) : makeEmojiString(itemList[hat].emoji!))
          : ''),
    },
    makskeres: {
      durability: n => `Izturība: ${n}/${maksekeresData[item.name].maxDurability}`,
    },
    naudas_maiss: {
      latiCollected: n =>
        n ? `Maisā ir ${latiString(n, false, !inline)}` : `${inline ? '' : '**'}Maiss ir tukšs${inline ? '' : '**'}`,
    },
    loto_zivs: {
      holdsFishCount: n => `Satur ${inline ? n : `**${n}**`} zivis`,
    },
    kakis: {
      createdAt: (n, { fedUntil, hat }) => {
        return (
          (fedUntil! < currTime
            ? `${inline ? '' : '_**'}MIRIS${inline ? '' : '**_'} ⚰️`
            : `Vecums: ${inline ? '' : '**'}${millisToReadableTime(currTime - n)}` +
              (inline ? ', ' : '**\n**') +
              kakisFedState.find(s => fedUntil! - currTime > s.time)?.name +
              (inline ? '' : '**')) +
          (hat
            ? `${inline ? ', ' : '\n'}Cepure: ` +
              (inline ? capitalizeFirst(itemList[hat].nameNomVsk) : makeEmojiString(itemList[hat].emoji!))
            : '')
        );
      },
    },
    patriota_piespraude: {
      piespraudeNum: n => `${inline ? '' : '**'}Nr. ${n}${inline ? '' : '**'}`,
    },
    gazes_plits: {
      cookingItem: (_, { cookingStartedTime, cookingItem }) => {
        if (!cookingItem) return 'Gatava cepšanai!';
        const { output, time } = cookableItems.find(({ input }) => input === cookingItem)!;
        const timeWhenDone = cookingStartedTime! + time;
        const isDoneCooking = timeWhenDone < currTime;

        const itemStr = (key: ItemKey) =>
          inline ? capitalizeFirst(itemList[key].nameNomVsk) : `**${itemString(key)}**`;

        if (isDoneCooking) {
          return `Izcepts: ${itemStr(output)}`;
        }

        return (
          `Cepjas: ${itemStr(cookingItem)}` +
          (inline ? `, ` : '\n') +
          `Gatavs pēc: ${inline ? '' : '`'}${millisToReadableTime(timeWhenDone - currTime)}${inline ? '' : '`'}`
        );
      },
    },
    ogu_krums: {
      // sita noladeta attributu uzradisana ir panemusi stundu no manas dzives (bumbotajs)
      // es ari esmu stulbs
      // AAAaaaAaAAaAAaAAAaaAaAaAaa

      lastUsed: (n, { maxBerries, growthTime, berryType, lastUsed }) => {
        const { cikNakamaOga, sobridOgas } = dabutOguInfo(item, currTime);
        const { izaudzis, cikIlgiAug, izaugsanasProg, augsanasLaiks, vajagApliet } = dabutKrumaInfo(item, currTime);
        const cikOgasRadit = Math.min(sobridOgas, maxBerries!);
        const itemStr = (key: ItemKey) =>
          inline ? capitalizeFirst(itemList[key].nameAkuDsk) : `**${capitalizeFirst(itemList[key].nameAkuDsk)}**`;
        return izaudzis === true // šitā ir reāla elle. ja elle pastāv, tad tā ir šeit
          ? `Audzē - ${itemStr(berryType!)} ${cikOgasRadit}/${maxBerries} ${
              sobridOgas < maxBerries! ? millisToReadableTime(cikNakamaOga) : ''
            }` + (inline ? `, ` : '\n')
          : vajagApliet
          ? `Krūms ir izslāpis! 🥵 ${izaugsanasProg}%`
          : inline
          ? `Krūms vēl aug... ${izaugsanasProg}%, `
          : `Krūms vēl aug... **${izaugsanasProg}%** `;
      },
    },
  };

  const attributes = Object.entries(item.attributes).filter(
    item => !hiddenAttributes.includes(item[0] as keyof ItemAttributes)
  );

  const textArr = attributes.map(([key, value]) => {
    let name = item.name;
    if (itemList[name].categories.includes(ItemCategory.MAKSKERE)) name = 'makskeres';

    return attributesLat[name][key as keyof ItemAttributes]!(value, item.attributes);
  });

  if (inline) return textArr.join(', ');
  return textArr.map(a => `${prefix}${a}`).join('\n');
}
