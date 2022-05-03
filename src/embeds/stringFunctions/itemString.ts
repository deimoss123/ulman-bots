import Item from '../../interfaces/Item'

export default function(item: Item, amount: number, akuzativs: boolean = false): string {
  // vienskaitlis
  if (amount % 10 === 1 && amount % 100 !== 11) {
    return akuzativs
      ? `${amount} ${item.nameAkuVsk}`
      : `${amount} ${item.nameNomVsk}`
  }

  // daudzskaitlis
  return akuzativs
    ? `${amount} ${item.nameAkuDsk}`
    : `${amount} ${item.nameNomDsk}`
}