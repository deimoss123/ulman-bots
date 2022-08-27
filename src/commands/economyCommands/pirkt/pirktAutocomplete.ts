import { AutocompleteInteraction } from 'discord.js';
import itemList, { ItemCategory } from '../../../items/itemList';
import getItemPrice from '../../../items/helpers/getItemPrice';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import latiString from '../../../embeds/helpers/latiString';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import Item from '../../../interfaces/Item';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `💰 [${latiString(getItemPrice(key).price)}] ` + `${capitalizeFirst(item.nameNomVsk)}`,
    value: key,
  };
}

export default async function pirktAutocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  const allChoices = Object.entries(itemList)
    .filter((obj) => obj[1].categories.includes(ItemCategory.VEIKALS)) // izfiltrētas veikala preces
    .sort((a, b) => b[1].value - a[1].value); // sakārtotas pēc vērtības

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices)).catch((_) => _);
}
