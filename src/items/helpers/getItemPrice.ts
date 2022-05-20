import itemList from '../itemList';

export default function getItemPrice(itemKey: string): number {

  // pagaidu funkcija, te tiks aprēķinātas atlaides
  return itemList[itemKey].value * 2;
}