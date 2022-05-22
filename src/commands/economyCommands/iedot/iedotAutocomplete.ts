import { AutocompleteInteraction } from 'discord.js';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import findUser from '../../../economy/findUser';
import Item from '../../../interfaces/Item';
import itemList from '../../../items/itemList';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';
import { ItemInProfile } from '../../../interfaces/UserProfile';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `✉️ ${capitalizeFirst(item.nameNomVsk)}`,
    value: key,
  };
}

function mapProfileItemsToItemsList(item: ItemInProfile): [string, Item] {
  return [item.name, itemList[item.name]];
}

export default async function iedotAutocomplete(interaction: AutocompleteInteraction): Promise<void> {

  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  let allChoices: [string, Item][] = Object.entries(itemList);

  const user = await findUser(interaction.user.id);
  if (user) {
    allChoices = user.items.map(mapProfileItemsToItemsList);
  }

  if (!allChoices.length) {
    await interaction.respond([{ name: 'Tev nav ko iedot', value: '' }])
    return
  }

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices));
}