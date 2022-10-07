import { AutocompleteInteraction } from 'discord.js';
import Item from '../../../interfaces/Item';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import itemList from '../../../items/itemList';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `🔍 ${capitalizeFirst(item.nameNomVsk)}`,
    value: key,
  };
}

export default async function infoAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  const allChoices = Object.entries(itemList);

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices)).catch(_ => _);
}
