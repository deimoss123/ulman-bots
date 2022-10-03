import itemString from '../../embeds/helpers/itemString';
import UserProfile from '../../interfaces/UserProfile';
import itemList, { ItemCategory, ItemKey } from '../itemList';

const FISHING_ROD_MAX_PER_USER = 20;
const SPECIAL_ITEM_MAX_PER_USER = 20;

type CheckUserSpecialItemsReturn = { valid: true } | { valid: false; reason: string };

export default function checkUserSpecialItems(
  { specialItems }: UserProfile,
  itemKey: ItemKey,
  amount = 1
): CheckUserSpecialItemsReturn {
  if (!specialItems.length) return { valid: true };

  // pārbauda vai ir makšķere
  if (itemList[itemKey].categories.includes(ItemCategory.MAKSKERE)) {
    const fishingRodCount = specialItems.filter(({ name }) =>
      itemList[name].categories.includes(ItemCategory.MAKSKERE)
    ).length;

    if (fishingRodCount + amount > FISHING_ROD_MAX_PER_USER) {
      return {
        valid: false,
        reason: `maksimālais iespējamais makšķeru skaits katra lietotāja inventārā ir **${FISHING_ROD_MAX_PER_USER}**`,
      };
    }
  } else {
    // pārējās mantas kas neiekļaujas kategorijā
    const itemCount = specialItems.filter(({ name }) => name === itemKey).length;
    if (itemCount + amount > SPECIAL_ITEM_MAX_PER_USER) {
      return {
        valid: false,
        reason:
          `maksimāli iespējamais skaits mantai **${itemString(itemList[itemKey])}** ` +
          `katra lietotāja inventārā ir **${SPECIAL_ITEM_MAX_PER_USER}**`,
      };
    }
  }

  return { valid: true };
}
