import { AutocompleteInteraction } from "discord.js";
import normalizeLatText from "@/utils/strings/normalizeLatText";
import Item from "@/types/Item";
import itemList, { ItemKey } from "@/utils/itemList";
import findUser from "@/db/findUser";
import { ItemInProfile } from "@/types/UserProfile";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import findItemsByQuery from "@/utils/findItemsByQuery";
import latiString from "@/utils/strings/latiString";

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name:
      `💵${"dynamicValue" in item && item.dynamicValue ? "" : ` [${latiString(item.value)}]`} ` +
      capitalizeFirst(item.nameNomVsk),
    value: key,
  };
}

function mapProfileItemsToItemsList(item: ItemInProfile): [string, Item] {
  return [item.name, itemList[item.name]];
}

export default async function pardotAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  const user = await findUser(interaction.user.id, interaction.guildId!);
  if (!user) return;

  const { specialItems } = user;
  const specialItemsList = [...new Set(specialItems.map((item) => item.name))]
    .map((key) => [key, itemList[key]])
    .filter(([, item]) => !("notSellable" in (item as Item))) as [ItemKey, Item][];

  const allChoices: [ItemKey, Item][] = [...user.items.map(mapProfileItemsToItemsList), ...specialItemsList];

  if (!allChoices.length) {
    await interaction.respond([{ name: "Tev nav ko pārdot", value: "no-items-inv" }]);
    return;
  }

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices)).catch((_) => _);
}
