import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionReplyOptions,
} from 'discord.js';
import addItems from '@/economy/addItems';
import addLati from '@/economy/addLati';
import findUser from '@/economy/findUser';
import setStats from '@/economy/stats/setStats';
import setUser from '@/economy/setUser';
import commandColors from '@/embeds/commandColors';
import embedTemplate from '@/embeds/embedTemplate';
import ephemeralReply from '@/embeds/ephemeralReply';
import errorEmbed from '@/embeds/errorEmbed';
import { displayAttributes } from '@/embeds/helpers/displayAttributes';
import itemString from '@/embeds/helpers/itemString';
import latiString from '@/embeds/helpers/latiString';
import Item from '@/interfaces/Item';
import UserProfile, { ItemAttributes } from '@/interfaces/UserProfile';
import itemList, { ItemKey } from '@/items/itemList';
import { emptyInvEmbed, PIRKT_PARDOT_NODOKLIS } from '@/commands/pardot/pardot';
import removeItemsById from '@/economy/removeItemsById';
import intReply from '@/utils/intReply';
import mongoTransaction from '@/utils/mongoTransaction';
import { Dialogs } from '@/utils/Dialogs';

interface ItemsToSell {
  name: string;
  amount: number | null;
  item: Item;
  attributes?: ItemAttributes;
  _id?: string;
}

export function pardotEmbed(i: BaseInteraction, user: UserProfile, itemsToSell: ItemsToSell[], soldItemsValue: number) {
  return embedTemplate({
    i,
    color: commandColors.pardot,
    title: 'Tu pārdevi',
    description:
      '>>> ' +
      itemsToSell
        .map(
          ({ name, item, amount, attributes }) =>
            `${itemString(item, amount, true, attributes)}` +
            (attributes ? `\n${displayAttributes({ name, attributes })}` : ''),
        )
        .join('\n'),
    fields: [
      {
        name: 'Tu ieguvi',
        value: latiString(soldItemsValue, true),
        inline: true,
      },
      {
        name: 'Tev tagad ir',
        value: latiString(user.lati),
        inline: true,
      },
    ],
  });
}

type State = {
  user: UserProfile;
  itemsToSell: ItemsToSell[];
  soldItemsValue: number;
  selected: 'ja' | 'ne' | null;
};

const enum ComponentId {
  Yes = 'pardot_visu_yes',
  No = 'pardot_visu_no',
}

function pardotVisuView(state: State, i: BaseInteraction): InteractionReplyOptions & { withResponse: true } {
  if (state.selected === 'ja') {
    return pardotEmbed(i, state.user, state.itemsToSell, state.soldItemsValue);
  }

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.Yes)
        .setLabel('Jā')
        .setStyle(state.selected ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(!!state.selected),
      new ButtonBuilder()
        .setCustomId(ComponentId.No)
        .setLabel('Nē')
        .setStyle(state.selected === 'ne' ? ButtonStyle.Success : ButtonStyle.Danger)
        .setDisabled(!!state.selected),
    ),
  ];

  // prettier-ignore
  return {
    embeds: [{
      description: 'Vai tiešām gribi pārdot **VISAS** savas mantas? (bīstami)',
      color: commandColors.pardot,
    }],
    withResponse: true,
    components,
  };
}

export default async function pardotRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  type: 'neizmantojamās' | 'visas',
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  const { items, specialItems } = user;

  if (!items.length && !specialItems.length) {
    return intReply(i, emptyInvEmbed());
  }

  if (type === 'neizmantojamās') {
    const unusuableItems = items.filter(item => !('use' in itemList[item.name]));
    if (!unusuableItems.length) {
      return intReply(i, ephemeralReply('Tavā inventārā nav neviena neizmantojama manta'));
    }

    const soldItemsValue = unusuableItems.reduce((p, c) => p + c.amount * itemList[c.name].value, 0);
    const itemsToSell = unusuableItems.map(({ name, amount }) => ({ name, amount, item: itemList[name] }));

    const itemsToSellObj: Record<ItemKey, number> = {};
    for (const { name, amount } of itemsToSell) itemsToSellObj[name] = -amount;

    const taxPaid = Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS);

    const { ok, values } = await mongoTransaction(session => [
      () => addLati(userId, guildId, soldItemsValue, session),
      () => addLati(i.client.user!.id, guildId, taxPaid, session),
      () => setStats(userId, guildId, { soldShop: soldItemsValue, taxPaid }, session),
      () => addItems(userId, guildId, itemsToSellObj, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    return intReply(i, pardotEmbed(i, values[3], itemsToSell, soldItemsValue));
  }

  // visas
  if (user.specialItems.length && !user.specialItems.find(({ name }) => !('notSellable' in itemList[name]))) {
    return intReply(i, ephemeralReply('Tavā inventārā nav neviena pārdodama manta'));
  }

  const initialState: State = {
    user,
    itemsToSell: [],
    soldItemsValue: 0,
    selected: null,
  };

  const dialogs = new Dialogs(i, initialState, pardotVisuView, 'pardot', { time: 30000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId, componentType } = int;

    if (componentType !== ComponentType.Button) return;

    if (customId === ComponentId.No) {
      state.selected = 'ne';
      return {
        update: true,
        end: true,
      };
    }

    if (customId === ComponentId.Yes) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const { lati, items, specialItems } = user;

      if (!items.length && !specialItems.length) {
        intReply(int, emptyInvEmbed());
        return { end: true };
      }

      const specialItemsToSell: ItemsToSell[] = specialItems
        .map(({ name, attributes, _id }) => ({ name, amount: null, item: itemList[name], attributes, _id }))
        .filter(({ item }) => !('notSellable' in item));

      const itemsToSell: ItemsToSell[] = [
        ...specialItemsToSell,
        ...items.map(({ name, amount }) => ({ name, amount, item: itemList[name] })),
      ];

      if (!itemsToSell.length) {
        intReply(int, ephemeralReply('Tavā inventārā nav neviena pārdodama manta'));
        return { end: true };
      }

      const soldItemsValue = itemsToSell.reduce((p, { item, amount, attributes }) => {
        return (
          p + ('customValue' in item && item.customValue ? item.customValue(attributes!) : item.value * (amount || 1))
        );
      }, 0);

      const tax = Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS);

      // prettier-ignore
      const { ok, values } = await mongoTransaction(session => [
        () => addLati(i.client.user!.id, guildId, tax, session),
        () => setUser(userId, guildId, { lati: lati + soldItemsValue, items: [] }, session),
        () => setStats(userId, guildId, { soldShop: soldItemsValue, taxPaid: tax }, session),
        () => removeItemsById(userId, guildId, specialItemsToSell.map(({ _id }) => _id!), session),
      ]);

      if (!ok) return { error: true };

      state.itemsToSell = itemsToSell;
      state.soldItemsValue = soldItemsValue;
      state.selected = 'ja';
      state.user = values[3];

      return {
        update: true,
        end: true,
      };
    }
  });
}
