import Item from '../../interfaces/Item';
import capitalizeFirst from './capitalizeFirst';

export default function(item: Item, amount: number = 0, akuzativs: boolean = false): string {
  const amountString = amount >= 1 ? `${amount.toString()} `: ''
  let result = ''

  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11 || amount === 0) {
    result = akuzativs
      ? `${amountString}${item.nameAkuVsk}`
      : `${amountString}${item.nameNomVsk}`;
  } else { // daudzskaitlis
    result = akuzativs
      ? `${amountString}${item.nameAkuDsk}`
      : `${amountString}${item.nameNomDsk}`;
  }

  return capitalizeFirst(result)
}