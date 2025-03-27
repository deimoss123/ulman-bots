import UserProfile from "@/interfaces/UserProfile";
import countItems from "@/items/helpers/countItems";

// saskaita cik brīvas vietas lietotāja inventārā
export default function countFreeInvSlots(user: UserProfile): number {
  const freeSlots = user.itemCap - countItems(user.items) - user.specialItems.length;

  return freeSlots > 0 ? freeSlots : 0;
}
