import {
  MessageActionRow,
  MessageButton, MessageButtonStyle,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js';
import Item from '../../../interfaces/Item';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import latiString from '../../../embeds/helpers/latiString';
import itemList from '../../../items/itemList';
import UserProfile from '../../../interfaces/UserProfile';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import getItemPrice from '../../../items/helpers/getItemPrice';

export default function veikalsComponents(
  shopItems: ([string, Item][]),
  user: UserProfile,
  chosenItem: string = '',
  chosenAmount: number = 1,
  buttonStyle: MessageButtonStyle | null = null,
) {
  let amountMenuOptions: MessageSelectOptionData[] = [];
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
    totalCost = getItemPrice(chosenItem) * chosenAmount;

    if (totalCost > user.lati) canAfford = false;
    if (countFreeInvSlots(user) < chosenAmount) hasInvSlots = false;
  }

  const disableBuy = chosenItem === '' || !canAfford || !hasInvSlots;

  let buttonRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setCustomId('veikals_pirkt')
    .setLabel('Pirkt' + (totalCost ? ` (${latiString(totalCost)})` : ''))
    .setStyle(
      buttonStyle || (disableBuy ? 'SECONDARY' : 'PRIMARY'),
    )
    .setEmoji(disableBuy ? '' : '911400812754915388')
    .setDisabled(disableBuy),
  );

  if (!canAfford) {
    buttonRow.addComponents(
      new MessageButton()
      .setCustomId('veikals_warn_1')
      .setLabel('Tev nepietiek naudas')
      .setStyle('DANGER')
      .setEmoji('❕')
      .setDisabled(true),
    );
  }

  if (!hasInvSlots) {
    buttonRow.addComponents(
      new MessageButton()
      .setCustomId('veikals_warn_2')
      .setLabel('Tev inventārā nav pietiekami vietas')
      .setStyle('DANGER')
      .setEmoji('❕')
      .setDisabled(true),
    );
  }

  return [
    new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
      .setCustomId('veikals_prece')
      .setPlaceholder(`Izvēlies preci, tev ir ${latiString(user.lati)}`)
      .addOptions(shopItems.map(([key, item]) => (
          {
            label: capitalizeFirst(item.nameNomVsk),
            description: latiString(getItemPrice(key)),
            value: key,
            emoji: '922501450544857098',
            default: key === chosenItem,
          }
        )),
      ),
    ),
    new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
      .setCustomId('veikals_daudzums')
      .setPlaceholder(`Daudzums: ${chosenAmount}`)
      .addOptions(amountMenuOptions),
    ),
    buttonRow,
  ];
}