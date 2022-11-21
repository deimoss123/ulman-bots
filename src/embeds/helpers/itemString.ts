import { APIMessageComponentEmoji } from 'discord.js';
import Item from '../../interfaces/Item';
import { ItemAttributes } from '../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../items/itemList';
import capitalizeFirst from './capitalizeFirst';

export function makeEmojiString(emoji: APIMessageComponentEmoji) {
  return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

// item string mantām ar customName atribūtu un bez emoji
export function itemStringCustom(item: Item, customName = '') {
  let name = '';
  if (customName) {
    switch (item.nameNomVsk) {
      case 'dīvainais burkāns':
        name = `"${customName}" burkāns`;
        break;
      case 'kaķis':
        name = `kaķis "${customName}"`;
        break;
    }
  }
  return capitalizeFirst(name || item.nameNomVsk);
}

export default function itemString(
  item: Item | ItemKey,
  amount: number | null = null,
  akuzativs = false,
  attributes?: ItemAttributes
): string {
  if (typeof item === 'string') item = itemList[item];
  const customName = attributes && attributes.customName ? attributes.customName : '';

  const emoji = attributes && 'customEmoji' in item && item.customEmoji ? item.customEmoji(attributes) : item.emoji;
  const emojiStr = emoji ? makeEmojiString(emoji) : '❓';

  let name = '';
  if (customName) {
    switch (item.nameNomVsk) {
      case 'dīvainais burkāns':
        name = akuzativs ? `"${customName}" burkānu` : `"${customName}" burkāns`;
        break;
      case 'kaķis':
        name = akuzativs ? `kaķi "${customName}"` : `kaķis "${customName}"`;
        break;
    }
  }

  if (amount === null) {
    return akuzativs
      ? `${emojiStr} ${capitalizeFirst(name || item.nameAkuVsk)}`
      : `${emojiStr} ${capitalizeFirst(name || item.nameNomVsk)}`;
  }

  let result: string;

  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11 && amount !== 0) {
    result = akuzativs ? item.nameAkuVsk : item.nameNomVsk;
  } else {
    // daudzskaitlis
    result = akuzativs ? item.nameAkuDsk : item.nameNomDsk;
  }

  return `${emojiStr} ${amount} ${capitalizeFirst(name || result)}`;
}
