import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import latiString from '../../../embeds/helpers/latiString';
import { AttributeItem } from '../../../interfaces/Item';
import UserProfile, { ItemAttributes } from '../../../interfaces/UserProfile';
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
  selectedFishingRodId?: string,
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
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
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_fishing_rod')
          .setPlaceholder('Izvēlies makšķeri')
          .addOptions(
            rodsInInv
              .slice(0, 25)
              .sort((a, b) => {
                const itemA = itemList[a.name] as AttributeItem<ItemAttributes>;
                const itemB = itemList[b.name] as AttributeItem<ItemAttributes>;
                return itemB.customValue!(b.attributes) - itemA.customValue!(a.attributes);
              })
              .map(item => ({
                label: capitalizeFirst(itemList[item.name].nameNomVsk),
                value: `${item.name} ${item._id}`,
                emoji: itemList[item.name].emoji ?? '❓',
                description: displayAttributes(item, true),
                default: selectedFishingRodId === item._id,
              })),
          ),
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
        .setStyle(ButtonStyle.Secondary),
    );
  }

  const { maxDurability, repairable } = maksekeresData[selectedRod];

  if (usesLeft < maxDurability) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId('fix_fishing_rod')
        .setLabel(
          repairable
            ? `Salabot makšķeri (${latiString(calcRepairCost(selectedRod, usesLeft))})`
            : 'Šī makšķere nav salabojama',
        )
        .setStyle(repairable ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setDisabled(!repairable)
        .setEmoji('🔧'),
    );
  }

  if (caughtFishes && Object.keys(caughtFishes).length) {
    buttons.unshift(collectFishButton);
  }

  const actionRows = [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)];

  return actionRows;
}
