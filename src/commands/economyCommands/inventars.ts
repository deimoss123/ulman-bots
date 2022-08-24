import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
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

    const { items, specialItems, itemCap } = targetUser;

    const totalValue =
      items.reduce((prev, { name, amount }) => {
        return prev + itemList[name]!.value * amount;
      }, 0) +
      specialItems.reduce((prev, { name }) => {
        return prev + itemList[name]!.value;
      }, 0);

    await i.reply(
      embedTemplate({
        i,
        title: target.id === i.user.id ? 'Tavs inventārs' : `${userString(target)} inventārs`,
        description: items.length
          ? `**${countItems(items) + specialItems.length}** mantas no **${itemCap}**\n` +
            `Inventāra vērtība: **${latiString(totalValue)}**\n\n` +
            `☑️ - izmantojams, ❌ - neizmantojams\n\u200b`
          : 'Tukšs inventārs :(',
        color: this.color,
        fields: mapItems(targetUser),
      })
    );
  },
};

export default inventars;
