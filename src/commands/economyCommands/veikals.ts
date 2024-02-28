import Command from '../../interfaces/Command';
import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
} from 'discord.js';
import itemList, { ItemCategory, ItemKey } from '../../items/itemList';
import embedTemplate from '../../embeds/embedTemplate';
import latiString from '../../embeds/helpers/latiString';
import commandColors from '../../embeds/commandColors';
import itemString from '../../embeds/helpers/itemString';
import findUser from '../../economy/findUser';
import pirktRun from './pirkt/pirktRun';
import errorEmbed from '../../embeds/errorEmbed';
import countFreeInvSlots from '../../items/helpers/countFreeInvSlots';
import getItemPrice from '../../items/helpers/getItemPrice';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import midNightStr from '../../embeds/helpers/midnightStr';
import getDiscounts from '../../items/helpers/getDiscounts';
import intReply from '../../utils/intReply';
import Item from '../../interfaces/Item';
import UserProfile from '../../interfaces/UserProfile';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import { Dialogs } from '../../utils/Dialogs';

type ShopItem = {
  key: ItemKey;
  itemObj: Item;
  price: number;
  discount: number | undefined;
};

type State = {
  user: UserProfile;
  shopItems: ShopItem[];
  chosenItem: ItemKey;
  chosenAmount: number;
  resetTime: number;
  timeUntilReset: number;
};

function view({ user, shopItems, chosenItem, chosenAmount, resetTime, timeUntilReset }: State, i: BaseInteraction) {
  const fields = shopItems.map(item => {
    let name = itemString(item.key);
    if (item.discount) {
      name += ` -${Math.floor(item.discount * 100)}%`;
    }

    const price = item.discount
      ? `~~${item.itemObj.value * 2}~~ ${latiString(item.price, false, true)}`
      : latiString(item.itemObj.value * 2);

    return {
      name,
      value: `Cena: ${price}`,
      inline: false,
    };
  });

  const amountMenuOptions: SelectMenuComponentOptionData[] = [];
  for (let i = 1; i <= 25; i++) {
    amountMenuOptions.push({ label: `${i}`, value: `${i}` });
  }

  let totalCost = 0;
  let canAfford = true;
  let hasFreeInvSlots = true;

  if (chosenItem) {
    totalCost = shopItems.find(({ key }) => key === chosenItem)!.price * chosenAmount;
    canAfford = user.lati >= totalCost;
    hasFreeInvSlots = countFreeInvSlots(user) >= chosenAmount;
  }

  const disableBuy = chosenItem === '' || !canAfford || !hasFreeInvSlots;

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('veikals_pirkt')
      .setLabel('Pirkt' + (totalCost ? ` (${latiString(totalCost)})` : ''))
      .setStyle(disableBuy ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setEmoji('911400812754915388')
      .setDisabled(disableBuy),
  );

  if (!canAfford) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId('veikals_warn_1')
        .setLabel('Tev nepietiek naudas')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❕')
        .setDisabled(true),
    );
  }

  if (!hasFreeInvSlots) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId('veikals_warn_2')
        .setLabel('Inventārā nepietiek vieta')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❕')
        .setDisabled(true),
    );
  }

  return embedTemplate({
    i,
    title: 'Veikals',
    description:
      'Nopirkt preci: `/pirkt <nosaukums> <daudzums>\n`' +
      `Atlaides mainās katru dienu plkst. <t:${Math.floor(resetTime / 1000)}:t> ` +
      `(pēc ${millisToReadableTime(timeUntilReset)})`,
    color: commandColors.veikals,
    fields,
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('veikals_prece')
          .setPlaceholder(`Izvēlies preci, tev ir ${latiString(user.lati)}`)
          .addOptions(
            shopItems.map(({ key, itemObj, price }) => ({
              label: capitalizeFirst(itemObj.nameNomVsk),
              description: latiString(price),
              value: key,
              emoji: itemObj.emoji || '❓',
              default: key === chosenItem,
            })),
          ),
      ),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('veikals_daudzums')
          .setPlaceholder(`Daudzums: ${chosenAmount}`)
          .addOptions(amountMenuOptions),
      ),
      buttonRow,
    ],
  });
}

const veikals: Command = {
  description:
    'Apskatīt visas preces, kas nopērkamas veikalā\n' +
    `Veikalā dažām precēm vienmēr būs atlaides, kas mainās katru dienu plkst. ${midNightStr()}`,
  color: commandColors.veikals,
  data: {
    name: 'veikals',
    description: 'Apskatīt veikalā nopērkamās preces',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const [user, discounts] = await Promise.all([findUser(userId, guildId), getDiscounts()]);
    if (!user || !discounts) return intReply(i, errorEmbed);

    // izfiltrē veikala mantas un sakārto pēc cenas
    const shopItems: ShopItem[] = Object.entries(itemList)
      .filter(obj => obj[1].categories.includes(ItemCategory.VEIKALS))
      .sort((a, b) => b[1].value - a[1].value)
      .map(([key, itemObj]) => ({ key, itemObj, ...getItemPrice(key, discounts) }));

    const defaultState: State = {
      user,
      shopItems,
      chosenItem: '',
      chosenAmount: 1,
      resetTime: new Date().setHours(24, 0, 0, 0),
      timeUntilReset: new Date().setHours(24, 0, 0, 0) - Date.now(),
    };

    const dialogs = new Dialogs(i, defaultState, view, 'veikals', { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async int => {
      const { customId, componentType: type } = int;

      if (customId === 'veikals_prece' && type === ComponentType.StringSelect) {
        dialogs.state.chosenItem = int.values[0];
        return { update: true };
      }

      if (customId === 'veikals_daudzums' && type === ComponentType.StringSelect) {
        dialogs.state.chosenAmount = +int.values[0];
        return { update: true };
      }

      if (customId === 'veikals_pirkt' && type === ComponentType.Button) {
        return {
          end: true,
          after: () => {
            pirktRun(int, dialogs.state.chosenItem, dialogs.state.chosenAmount, commandColors.pirkt);
          },
        };
      }
    });
  },
};

export default veikals;
