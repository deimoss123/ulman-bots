import Item from '../../interfaces/Item';
import capitalizeFirst from './capitalizeFirst';

export default function itemString(
  item: Item,
  amount: number | null = null,
  akuzativs = false
): string {
  const emojiStr = item.emoji || '❓';

  if (amount === null) {
    return `${emojiStr} ${capitalizeFirst(item.nameNomVsk)}`;
  }

  let result: string;

  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11 && amount !== 0) {
    result = akuzativs ? item.nameAkuVsk : item.nameNomVsk;
  } else {
    // daudzskaitlis
    result = akuzativs ? item.nameAkuDsk : item.nameNomDsk;
  }

  return `${emojiStr} ${amount} ${capitalizeFirst(result)}`;
}
