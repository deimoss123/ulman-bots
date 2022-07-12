import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import { AutocompleteInteraction } from 'discord.js';
import Item from '../../../interfaces/Item';
import itemList from '../../../items/itemList';
import findUser from '../../../economy/findUser';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { ItemInProfile } from '../../../interfaces/UserProfile';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `🛠️ ${capitalizeFirst(item.nameNomVsk)}`,
    value: key,
  };
}

function mapProfileItemsToItemsList(item: ItemInProfile): [string, Item] {
  return [item.name, itemList[item.name] as Item];
}

function filterByUsable(item: [string, Item]) {
  return !!item[1].use;
}

export default async function izmantotAutocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  // lietotāja ievadītais teksts
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  let allChoices: [string, Item][] = Object.entries(itemList).filter(filterByUsable);

  const user = await findUser(interaction.user.id);
  if (user) {
    allChoices = user.items.map(mapProfileItemsToItemsList).filter(filterByUsable);
  }

  if (!allChoices.length) {
    await interaction.respond([{ name: 'Tev nav ko izmantot', value: '' }]);
    return;
  }

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices));
}
