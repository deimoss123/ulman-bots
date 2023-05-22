import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
} from 'discord.js';
import Item from '../../../interfaces/Item';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import latiString from '../../../embeds/helpers/latiString';
import UserProfile from '../../../interfaces/UserProfile';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import getItemPrice from '../../../items/helpers/getItemPrice';
import { DiscountedItems } from '../../../items/itemList';

export default function veikalsComponents(
  shopItems: [string, Item][],
  user: UserProfile,
  discounts: DiscountedItems,
  chosenItem = '',
  chosenAmount = 1,
  buttonStyle: ButtonStyle | null = null
) {
  const amountMenuOptions: SelectMenuComponentOptionData[] = [];
  for (let i = 1; i <= 25; i++) {
    amountMenuOptions.push({
      label: i.toString(),
      value: i.toString(),
    });
  }

  let totalCost = 0;
  let canAfford = true;
  let hasInvSlots = true;

  if (chosenItem && user) {
    totalCost = getItemPrice(chosenItem, discounts).price * chosenAmount;

    if (totalCost > user.lati) canAfford = false;
    if (countFreeInvSlots(user) < chosenAmount) hasInvSlots = false;
  }

  const disableBuy = chosenItem === '' || !canAfford || !hasInvSlots;

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('veikals_pirkt')
      .setLabel('Pirkt' + (totalCost ? ` (${latiString(totalCost)})` : ''))
      .setStyle(buttonStyle || (disableBuy ? ButtonStyle.Secondary : ButtonStyle.Primary))
      .setEmoji(disableBuy ? '911400812754915388' : '911400812754915388')
      .setDisabled(disableBuy)
  );

  if (!canAfford) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId('veikals_warn_1')
        .setLabel('Tev nepietiek naudas')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❕')
        .setDisabled(true)
    );
  }

  if (!hasInvSlots) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId('veikals_warn_2')
        .setLabel('Tev inventārā nav pietiekami vietas')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❕')
        .setDisabled(true)
    );
  }

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('veikals_prece')
        .setPlaceholder(`Izvēlies preci, tev ir ${latiString(user.lati)}`)
        .addOptions(
          shopItems.map(([key, item]) => ({
            label: capitalizeFirst(item.nameNomVsk),
            description: latiString(getItemPrice(key, discounts).price),
            value: key,
            emoji: item.emoji || '❓',
            default: key === chosenItem,
          }))
        )
    ),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('veikals_daudzums')
        .setPlaceholder(`Daudzums: ${chosenAmount}`)
        .addOptions(amountMenuOptions)
    ),
    buttonRow,
  ];
}
