import maksekeresData from '../../commands/economyCommands/zvejot/makskeresData';
import { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import itemList, { ItemCategory } from '../../items/itemList';
import { KAFIJAS_APARATS_COOLDOWN } from '../../items/usableItems/kafijas_aparats';
import { kakisFedState } from '../../items/usableItems/kakis';
import { PETNIEKS_COOLDOWN } from '../../items/usableItems/petnieks';
import capitalizeFirst from './capitalizeFirst';
import { makeEmojiString } from './itemString';
import latiString from './latiString';
import millisToReadableTime from './millisToReadableTime';

const hiddenAttributes: Partial<keyof ItemAttributes>[] = ['customName', 'foundItemKey', 'fedUntil', 'isCooked', 'hat'];

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
          ? `${inline ? '' : '**'}Nopētījis:${inline ? '' : '**'} ${itemList[foundItemKey!].nameAkuVsk}`
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
