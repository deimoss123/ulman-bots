import { AutocompleteInteraction } from 'discord.js';
import Item from '../../../interfaces/Item';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import itemList from '../../../items/itemList';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';

function mapItemsToChoices(emoji: string) {
  return (itemInList: [string, Item]) => {
    const [key, item] = itemInList;

    return {
      name: `${emoji} ${capitalizeFirst(item.nameNomVsk)}`,
      value: key,
    };
  };
}

function allItemAutocomplete(emoji: string) {
  return (interaction: AutocompleteInteraction) => {
    // lietotāja ievadītais teksts
    const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

    const allChoices = Object.entries(itemList);

    const queriedChoices = findItemsByQuery(focusedValue, allChoices);
    interaction.respond(queriedChoices.map(mapItemsToChoices(emoji))).catch(_ => _);
  };
}

export default allItemAutocomplete;
