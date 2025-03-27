import { ItemInProfile } from "@/types/UserProfile";

// saskaita itemus iekš itemu masīva
export default function countItems(items: ItemInProfile[]): number {
  if (!items.length) return 0;

  return items.reduce((previous, { amount }) => previous + amount, 0);
}
