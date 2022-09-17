import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } from 'discord.js';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import UserProfile from '../../../interfaces/UserProfile';
import itemList, { ItemCategory } from '../../../items/itemList';

const collectFishButton = new ButtonBuilder()
  .setCustomId('collect_fish')
  .setLabel('Savākt copi')
  .setStyle(ButtonStyle.Success);

export default function zvejotComponents(
  { specialItems, fishing }: UserProfile,
  selectedFishingRodId?: string
): ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] {
  if (!fishing.selectedRod) {
    const rodsInInv = specialItems.filter(item => itemList[item.name].categories.includes(ItemCategory.MAKSKERE));
    if (!rodsInInv.length) {
      const btnRow = [
        new ButtonBuilder()
          .setCustomId('nuja')
          .setLabel('Tev nav nevienas makšķeres')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      ];

      if (fishing.coughtFishes && fishing.coughtFishes.length) btnRow.push(collectFishButton);

      return [new ActionRowBuilder<ButtonBuilder>().addComponents(btnRow)];
    }

    const btnRow = [
      new ButtonBuilder()
        .setCustomId('start_fishing_btn')
        .setLabel('Sākt zvejot')
        .setStyle(selectedFishingRodId ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!selectedFishingRodId),
    ];

    if (fishing.coughtFishes && fishing.coughtFishes.length) btnRow.push(collectFishButton);

    return [
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('select_fishing_rod')
          .setPlaceholder('Izvēlies makšķeri')
          .addOptions(
            rodsInInv.map(item => ({
              label: capitalizeFirst(itemList[item.name].nameNomVsk),
              value: `${item.name} ${item._id}`,
              emoji: itemList[item.name].emoji ?? '❓',
              description: displayAttributes(item, true),
              default: selectedFishingRodId === item._id,
            }))
          )
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(...btnRow),
    ];
  }

  const buttons = [
    collectFishButton,
    new ButtonBuilder().setCustomId('remove_fishing_rod').setLabel('Noņemt makšķeri').setStyle(ButtonStyle.Primary),
  ];

  const actionRows = [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)];

  return actionRows;
}
