import { AutocompleteInteraction } from 'discord.js';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import Item from '../../../interfaces/Item';
import itemList from '../../../items/itemList';
import findUser from '../../../economy/findUser';
import { ItemInProfile } from '../../../interfaces/UserProfile';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';
import latiString from '../../../embeds/helpers/latiString';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `💵 [${latiString(item.value)}] ${capitalizeFirst(item.nameNomVsk)}`,
    value: key,
  };
}

function mapProfileItemsToItemsList(item: ItemInProfile): [string, Item] {
  return [item.name, itemList[item.name]];
}

export default async function pardotAutocomplete(interaction: AutocompleteInteraction): Promise<void> {

  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  let allChoices: [string, Item][] = Object.entries(itemList).sort((a, b) => b[1].value - a[1].value);

  const user = await findUser(interaction.user.id);
  if (user) {
    allChoices = user.items.map(mapProfileItemsToItemsList);
  }

  if (!allChoices.length) {
    await interaction.respond([{ name: 'Tev nav ko pārdot', value: '' }]);
    return;
  }

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices));
}