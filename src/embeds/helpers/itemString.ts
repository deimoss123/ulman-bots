import { APIMessageComponentEmoji } from 'discord.js';
import Item from '../../interfaces/Item';
import capitalizeFirst from './capitalizeFirst';

export function makeEmojiString(emoji: APIMessageComponentEmoji) {
  return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

// item string priekš mantas ar customName atribūtu un bez emoji
export function itemStringCustom(item: Item, customName = '') {
  let name = '';
  if (customName) {
    if (item.nameNomVsk === 'dīvainais burkāns') {
      name = `"${customName}" burkāns`;
    }
  }
  return name || capitalizeFirst(item.nameNomVsk);
}

export default function itemString(
  item: Item,
  amount: number | null = null,
  akuzativs = false,
  customName = ''
): string {
  const emojiStr = item.emoji ? makeEmojiString(item.emoji) : '❓';

  let name = '';
  if (customName) {
    if (item.nameNomVsk === 'dīvainais burkāns') {
      name = `"${customName}" burkāns`;
    }
  }

  if (amount === null) {
    return `${emojiStr} ${name || capitalizeFirst(item.nameNomVsk)}`;
  }

  let result: string;

  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11 && amount !== 0) {
    result = akuzativs ? item.nameAkuVsk : item.nameNomVsk;
  } else {
    // daudzskaitlis
    result = akuzativs ? item.nameAkuDsk : item.nameNomDsk;
  }

  return `${emojiStr} ${amount} ${name || capitalizeFirst(result)}`;
}
