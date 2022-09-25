import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } from 'discord.js';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import latiString from '../../../embeds/helpers/latiString';
import UserProfile from '../../../interfaces/UserProfile';
import itemList, { ItemCategory } from '../../../items/itemList';
import maksekeresData from './makskeresData';
import { calcRepairCost } from './zvejot';

const ziveEmoji = {
  name: 'zive',
  id: '1023703062054965329',
  animated: true,
};

const collectFishButton = new ButtonBuilder()
  .setCustomId('collect_fish_btn')
  .setLabel('Savākt copi')
  .setStyle(ButtonStyle.Success)
  .setEmoji(ziveEmoji);

export default function zvejotComponents(
  user: UserProfile,
  selectedFishingRodId?: string
): ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] {
  const { specialItems, fishing } = user;
  const { selectedRod, usesLeft, caughtFishes } = fishing;

  if (!selectedRod) {
    const rodsInInv = specialItems.filter(item => itemList[item.name].categories.includes(ItemCategory.MAKSKERE));
    if (!rodsInInv.length) {
      const btnRow = [
        new ButtonBuilder()
          .setCustomId('nuja')
          .setLabel('Tev nav nevienas makšķeres')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      ];

      if (caughtFishes && caughtFishes.length) btnRow.push(collectFishButton);

      return [new ActionRowBuilder<ButtonBuilder>().addComponents(btnRow)];
    }

    const btnRow = [
      new ButtonBuilder()
        .setCustomId('start_fishing_btn')
        .setLabel('Sākt zvejot')
        .setStyle(selectedFishingRodId ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!selectedFishingRodId),
    ];

    if (caughtFishes && Object.keys(caughtFishes).length) btnRow.push(collectFishButton);

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
    new ButtonBuilder()
      .setCustomId('remove_fishing_rod')
      .setLabel('Noņemt makšķeri')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(itemList[selectedRod].emoji || '❓'),
  ];
  if (user.guildId === process.env.DEV_SERVER_ID) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId('test_button')
        .setLabel('Atjaunot (testēšanas poga)')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (usesLeft < maksekeresData[selectedRod].maxDurability) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId('fix_fishing_rod')
        .setLabel(`Salabot makšķeri (${latiString(calcRepairCost(selectedRod, usesLeft))})`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔧')
    );
  }

  if (caughtFishes && Object.keys(caughtFishes).length) {
    buttons.unshift(collectFishButton);
  }

  const actionRows = [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)];

  return actionRows;
}
