import Item from '../../interfaces/Item';

export default function(item: Item, amount: number = 0, akuzativs: boolean = false): string {
  // TODO: pievienot iespēju uzlikt amount par 0 lai nerādītos mantas daudzums

  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11) {
    return akuzativs
      ? `${amount} ${item.nameAkuVsk}`
      : `${amount} ${item.nameNomVsk}`;
  }

  // daudzskaitlis
  return akuzativs
    ? `${amount} ${item.nameAkuDsk}`
    : `${amount} ${item.nameNomDsk}`;
}