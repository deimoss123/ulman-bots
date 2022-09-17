import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } from 'discord.js';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import UserProfile from '../../../interfaces/UserProfile';
import itemList, { ItemCategory } from '../../../items/itemList';

export default function zvejotComponents(
  isFishing: boolean,
  selectedFishingRodId: string,
  { specialItems, fishing }: UserProfile
): ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] {
  const buttons: ButtonBuilder[] = [];

  if (!isFishing) {
    const rodsInInv = specialItems.filter(item => itemList[item.name].categories.includes(ItemCategory.MAKSKERE));
    if (!rodsInInv.length) {
      const btnRow = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('nuja')
            .setLabel('Tev nav nevienas makšķeres')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        ),
      ];

      return btnRow;
    }

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
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('start_fishing_btn')
          .setLabel('Sākt zvejot')
          .setStyle(selectedFishingRodId ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(!selectedFishingRodId)
      ),
    ];
  }

  if (isFishing) {
    buttons.push(
      new ButtonBuilder().setCustomId('collect_fish').setLabel('Savākt zivis').setStyle(ButtonStyle.Primary)
    );
  } else {
  }

  const actionRows: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons),
  ];

  return actionRows;
}
