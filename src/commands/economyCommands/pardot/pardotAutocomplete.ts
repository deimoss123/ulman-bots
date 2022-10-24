import { AutocompleteInteraction } from 'discord.js';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import Item from '../../../interfaces/Item';
import itemList, { ItemKey } from '../../../items/itemList';
import findUser from '../../../economy/findUser';
import { ItemInProfile } from '../../../interfaces/UserProfile';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import findItemsByQuery from '../../../items/helpers/findItemsByQuery';
import latiString from '../../../embeds/helpers/latiString';

function mapItemsToChoices(itemInList: [string, Item]) {
  const [key, item] = itemInList;

  return {
    name: `💵${item.customValue ? '' : ` [${latiString(item.value)}]`} ${capitalizeFirst(item.nameNomVsk)}`,
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

  const user = await findUser(interaction.user.id, interaction.guildId!);
  if (user) {
    const { specialItems } = user;
    const specialItemsList = [...new Set(specialItems.map(item => item.name))].map(key => [key, itemList[key]]) as [
      ItemKey,
      Item
    ][];

    allChoices = [...user.items.map(mapProfileItemsToItemsList), ...specialItemsList];
  }

  if (!allChoices.length) {
    await interaction.respond([{ name: 'Tev nav ko pārdot', value: 'no-items-inv' }]);
    return;
  }

  const queriedChoices = findItemsByQuery(focusedValue, allChoices);
  await interaction.respond(queriedChoices.map(mapItemsToChoices)).catch(_ => _);
}
