import { AutocompleteInteraction } from "discord.js";
import itemList from "@/utils/itemList";
import getItemPrice from "@/items/helpers/getItemPrice";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import latiString from "@/utils/strings/latiString";
import findItemsByQuery from "@/items/helpers/findItemsByQuery";
import normalizeLatText from "@/utils/strings/normalizeLatText";
import getDiscounts from "@/items/helpers/getDiscounts";
import { ItemCategory } from "@/types/Item";

export default async function pirktAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  const allChoices = Object.entries(itemList)
    .filter((obj) => obj[1].categories.includes(ItemCategory.VEIKALS)) // izfiltrētas veikala preces
    .sort((a, b) => b[1].value - a[1].value); // sakārtotas pēc vērtības

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);

  const discounts = await getDiscounts();
  if (!discounts) return;

  await interaction
    .respond(
      queriedChoices.map(([key, item]) => ({
        name: `💰 [${latiString(getItemPrice(key, discounts).price)}] ` + `${capitalizeFirst(item.nameNomVsk)}`,
        value: key,
      })),
    )
    .catch((_) => _);
}
