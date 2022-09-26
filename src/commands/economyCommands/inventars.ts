import Command from '../../interfaces/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedField,
  User,
} from 'discord.js';
import embedTemplate from '../../embeds/embedTemplate';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemList from '../../items/itemList';
import latiString from '../../embeds/helpers/latiString';
import userString from '../../embeds/helpers/userString';
import countItems from '../../items/helpers/countItems';
import commandColors from '../../embeds/commandColors';
import itemString from '../../embeds/helpers/itemString';
import ephemeralReply from '../../embeds/ephemeralReply';
import UserProfile, { ItemInProfile, SpecialItemInProfile } from '../../interfaces/UserProfile';
import Item from '../../interfaces/Item';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import buttonHandler from '../../embeds/buttonHandler';

type ItemType = 'not_usable' | 'usable' | 'special' | 'not_sellable';
const itemTypes: Record<ItemType, { text: string; emoji?: string }> = {
  not_sellable: {
    text: 'nepārdodama un neiedodama manta',
    emoji: '<:check3:1017598453032943636>',
  },
  special: {
    text: 'īpaša manta ar atribūtiem',
    emoji: '<:check2:1017601966555267132>',
  },
  usable: {
    text: 'izmantojams',
    emoji: '<:check1:1017600596213235723>',
  },
  not_usable: {
    text: 'neizmantojams',
    emoji: '<:cross:1017600096143151164>',
  },
};

function mapItems({ items, specialItems }: UserProfile) {
  const itemTypesInInv = new Set<ItemType>();
  if (specialItems.length) itemTypesInInv.add('special');

  const specialItemsFields = specialItems
    .sort((a, b) => {
      const itemA = itemList[a.name];
      const itemB = itemList[b.name];

      return (
        (itemB.customValue ? itemB.customValue(b.attributes) : itemB.value) -
        (itemA.customValue ? itemA.customValue(a.attributes) : itemA.value)
      );
    })

    .map(specialItem => {
      const { name, attributes } = specialItem;
      const item = itemList[name] as Item;

      const value = item.customValue ? item.customValue(attributes) : item.value;

      return {
        name: itemString(item, null, false, attributes?.customName),
        value: `${itemTypes.special.emoji} ${latiString(value)}\n` + displayAttributes(specialItem),
        inline: true,
      };
    });

  const usableItems: ItemInProfile[] = [];
  const unusableItems: ItemInProfile[] = [];

  items.forEach(item => {
    const itemObj = itemList[item.name];
    if (itemObj.use) usableItems.push(item);
    else unusableItems.push(item);
  });

  const sortedItems: ItemInProfile[] = [
    ...usableItems.sort((a, b) => itemList[b.name].value - itemList[a.name].value),
    ...unusableItems.sort((a, b) => itemList[b.name].value - itemList[a.name].value),
  ];

  const itemFields = sortedItems.map(({ name, amount }) => {
    const item = itemList[name] as Item;

    let currentItemType: ItemType;

    if (item.use) currentItemType = 'usable';
    else currentItemType = 'not_usable';

    itemTypesInInv.add(currentItemType);

    return {
      name: `${itemString(item)} x${amount}`,
      value: `${itemTypes[currentItemType].emoji} ${latiString(item.value)}`,
      inline: true,
    };
  });

  return {
    fields: [...specialItemsFields, ...itemFields],
    itemTypesInv: Array.from(itemTypesInInv),
  };
}

export function getInvValue(items: ItemInProfile[], specialItems: SpecialItemInProfile[]) {
  return (
    items.reduce((prev, { name, amount }) => {
      return prev + itemList[name]!.value * amount;
    }, 0) +
    specialItems.reduce((prev, { name, attributes }) => {
      return prev + (itemList[name].customValue ? itemList[name].customValue!(attributes) : itemList[name].value);
    }, 0)
  );
}

const INV_PAGE_SIZE = 12;

function makeEmbed(
  i: ChatInputCommandInteraction,
  target: User,
  targetUser: UserProfile,
  fields: EmbedField[],
  currentPage: number,
  itemTypesInv: ItemType[]
) {
  const { items, specialItems, itemCap } = targetUser;

  const totalValue = getInvValue(items, specialItems);

  const fieldsToShow = fields.slice(currentPage * INV_PAGE_SIZE, (currentPage + 1) * INV_PAGE_SIZE);

  return embedTemplate({
    i,
    title: targetUser.userId === i.user.id ? 'Tavs inventārs' : `${userString(target)} inventārs`,
    description:
      items.length + specialItems.length
        ? `**${countItems(items) + specialItems.length}** mantas no **${itemCap}**\n` +
          `Inventāra vērtība: **${latiString(totalValue)}**\n\n` +
          Object.entries(itemTypes).reduce(
            (prev, [key, { text, emoji }]) =>
              itemTypesInv.includes(key as ItemType) ? prev + `${emoji} - ${text}\n` : prev,
            ''
          ) +
          '\u2800'
        : 'Tukšs inventārs :(',
    color: commandColors.inventars,
    fields: fieldsToShow,
  }).embeds;
}

function paginationRow(currentPage: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('_')
      .setLabel(`${currentPage + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('inv_prev_page')
      .setLabel('Iepriekšējā lapa')
      .setDisabled(currentPage === 0)
      .setStyle(currentPage === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('inv_next_page')
      .setLabel('Nākamā lapa')
      .setDisabled(currentPage + 1 === totalPages)
      .setStyle(currentPage + 1 === totalPages ? ButtonStyle.Secondary : ButtonStyle.Primary)
  );
}

function sellRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('__').setLabel(`test`).setStyle(ButtonStyle.Primary).setDisabled(true)
  );
}

const inventars: Command = {
  title: 'Inventārs',
  description: 'Apskatīt savu vai kāda lietotāja inventāru',
  color: commandColors.inventars,
  data: {
    name: 'inv',
    description: 'Apskatīt inventāru',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt inventāru',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs') || i.user;

    const targetUser = await findUser(target.id, i.guildId!);
    if (!targetUser) return i.reply(errorEmbed);

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari apskatīt Valsts Bankas inventāru'));
    }

    const { fields, itemTypesInv } = mapItems(targetUser);

    const totalPages = Math.ceil(fields.length / INV_PAGE_SIZE);
    let currentPage = 0;

    const components = [sellRow()];
    if (fields.length > INV_PAGE_SIZE) components.unshift(paginationRow(currentPage, totalPages));

    const msg = await i.reply({
      embeds: makeEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
      components,
      fetchReply: true,
    });

    await buttonHandler(
      i,
      'inventārs',
      msg,
      async interaction => {
        const { customId } = interaction;
        if (interaction.componentType !== ComponentType.Button) return;

        switch (customId) {
          case 'inv_prev_page': {
            currentPage--;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            return {
              edit: {
                embeds: makeEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: [paginationRow(currentPage, totalPages), sellRow()],
              },
            };
          }
          case 'inv_next_page': {
            currentPage++;
            if (currentPage < 0) currentPage = 0;
            return {
              edit: {
                embeds: makeEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: [paginationRow(currentPage, totalPages), sellRow()],
              },
            };
          }
        }
      },
      60000
    );
  },
};

export default inventars;
