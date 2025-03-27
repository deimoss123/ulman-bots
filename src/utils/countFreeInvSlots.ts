import UserProfile from "@/types/UserProfile";
import countItems from "@/utils/countItems";

// saskaita cik brīvas vietas lietotāja inventārā
export default function countFreeInvSlots(user: UserProfile): number {
  const freeSlots = user.itemCap - countItems(user.items) - user.specialItems.length;

  return freeSlots > 0 ? freeSlots : 0;
}
