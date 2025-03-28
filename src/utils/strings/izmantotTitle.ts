import { SpecialItemInProfile } from "@/types/UserProfile";
import { ItemKey } from "@/utils/itemList";
import itemString from "@/utils/strings/itemString";

function izmantotTitle(item: ItemKey | SpecialItemInProfile) {
  const prefix = "Izmantot:";
  if (typeof item === "string") {
    return `${prefix} ${itemString(item, null, true)}`;
  }

  return `${prefix} ${itemString(item.name, null, true, item.attributes)}`;
}

export default izmantotTitle;
