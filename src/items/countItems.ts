import { ItemInProfile } from '../interfaces/UserProfile';

// saskaita itemus iekš itemu masīva
export default function(items: ItemInProfile[]): number {
  if (!items.length) return 0;

  return items.reduce((previous, { amount }) => {
    return previous + amount;
  }, 0);
}