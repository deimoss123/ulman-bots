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
import UserProfile, { ItemInProfile } from '../../interfaces/UserProfile';
import Item from '../../interfaces/Item';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import buttonHandler from '../../embeds/buttonHandler';

function mapItems({ items, specialItems }: UserProfile) {
  const specialItemsFields = specialItems
    .sort((a, b) => itemList[b.name].value - itemList[a.name].value)
    .map((specialItem) => {
      const { name, attributes } = specialItem;
      const item = itemList[name] as Item;

      return {
        name: itemString(item, null, false, attributes?.customName),
        value:
          `${item.use ? '☑️' : '❌'} ${latiString(item.value)}\n` + displayAttributes(specialItem),
        inline: true,
      };
    });

  const usableItems: ItemInProfile[] = [];
  const unusableItems: ItemInProfile[] = [];

  items.forEach((item) => {
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

    return {
      name: `${itemString(item)} x${amount}`,
      value: `${item.use ? '☑️' : '❌'} ${latiString(item.value)}`,
      inline: true,
    };
  });

  return [...specialItemsFields, ...itemFields];
}

const INV_PAGE_SIZE = 12;

function makeEmbed(
  i: ChatInputCommandInteraction,
  target: User,
  targetUser: UserProfile,
  fields: EmbedField[],
  color: number,
  currentPage: number
) {
  const { items, specialItems, itemCap } = targetUser;

  const totalValue =
    items.reduce((prev, { name, amount }) => {
      return prev + itemList[name]!.value * amount;
    }, 0) +
    specialItems.reduce((prev, { name }) => {
      return prev + itemList[name]!.value;
    }, 0);

  const fieldsToShow = fields.slice(currentPage * INV_PAGE_SIZE, (currentPage + 1) * INV_PAGE_SIZE);

  return embedTemplate({
    i,
    title: targetUser.userId === i.user.id ? 'Tavs inventārs' : `${userString(target)} inventārs`,
    description: items.length
      ? `**${countItems(items) + specialItems.length}** mantas no **${itemCap}**\n` +
        `Inventāra vērtība: **${latiString(totalValue)}**\n\n` +
        `☑️ - izmantojams, ❌ - neizmantojams\n\u200b`
      : 'Tukšs inventārs :(',
    color,
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
    new ButtonBuilder()
      .setCustomId('__')
      .setLabel(`test`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)
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

    const targetUser = await findUser(target.id);
    if (!targetUser) return i.reply(errorEmbed);

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari apskatīt Valsts Bankas inventāru'));
    }

    const fields = mapItems(targetUser);

    const totalPages = Math.ceil(fields.length / INV_PAGE_SIZE);
    let currentPage = 0;

    const components = [sellRow()];
    if (fields.length > INV_PAGE_SIZE) components.unshift(paginationRow(currentPage, totalPages));

    const msg = await i.reply({
      embeds: makeEmbed(i, target, targetUser, fields, this.color, currentPage),
      components,
      fetchReply: true,
    });

    await buttonHandler(
      i,
      'inventārs',
      msg,
      async (interaction) => {
        const { customId } = interaction;
        if (interaction.componentType !== ComponentType.Button) return;

        switch (customId) {
          case 'inv_prev_page': {
            currentPage--;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            return {
              edit: {
                embeds: makeEmbed(i, target, targetUser, fields, this.color, currentPage),
                components: [paginationRow(currentPage, totalPages), sellRow()],
              },
            };
          }
          case 'inv_next_page': {
            currentPage++;
            if (currentPage < 0) currentPage = 0;
            return {
              edit: {
                embeds: makeEmbed(i, target, targetUser, fields, this.color, currentPage),
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
