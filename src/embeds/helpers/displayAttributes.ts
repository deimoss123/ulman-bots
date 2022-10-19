import maksekeresData from '../../commands/economyCommands/zvejot/makskeresData';
import { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import itemList, { ItemCategory, ItemKey } from '../../items/itemList';
import { KAFIJAS_APARATS_COOLDOWN } from '../../items/usableItems/kafijas_aparats';
import { PETNIEKS_COOLDOWN } from '../../items/usableItems/petnieks';
import latiString from './latiString';
import millisToReadableTime from './millisToReadableTime';

const hiddenAttributes = ['customName', 'foundItemKey'];

export function displayAttributes(item: SpecialItemInProfile, inline = false) {
  const attributesLat: Record<
    ItemKey,
    Partial<Record<keyof ItemAttributes, (n: number, attributes: ItemAttributes) => string>>
  > = {
    divainais_burkans: {
      timesUsed: n =>
        `Nokosts ${inline ? '' : '**'}${n}${inline ? '' : '**'} ` +
        `reiz${n % 10 === 1 && n % 100 !== 11 ? 'i' : 'es'}`,
    },
    kafijas_aparats: {
      lastUsed: n =>
        Date.now() - n >= KAFIJAS_APARATS_COOLDOWN
          ? `${inline ? '' : '**'}Kafija gatava!${inline ? '' : '**'}`
          : `Gatavo: ${inline ? '' : '`'}` +
            millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - Date.now() + n) +
            (inline ? '' : '`'),
    },
    petnieks: {
      lastUsed: (n, attributes) =>
        Date.now() - n >= PETNIEKS_COOLDOWN
          ? `${inline ? '' : '**'}Nopētījis:${inline ? '' : '**'} ${itemList[attributes.foundItemKey!].nameAkuVsk}`
          : `Pēta: ${inline ? '' : '`'}` +
            `${millisToReadableTime(PETNIEKS_COOLDOWN - Date.now() + n)}` +
            (inline ? '' : '`'),
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
  };

  const attributes = Object.entries(item.attributes).filter(item => !hiddenAttributes.includes(item[0]));

  const textArr = attributes.map(([key, value]) => {
    let name = item.name;
    if (itemList[name].categories.includes(ItemCategory.MAKSKERE)) name = 'makskeres';

    return attributesLat[name][key as keyof ItemAttributes]!(value, item.attributes);
  });

  if (inline) return textArr.join(', ');
  return textArr.join('\n');
}
