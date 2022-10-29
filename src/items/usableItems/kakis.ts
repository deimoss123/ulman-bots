import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SelectMenuBuilder,
  time,
} from 'discord.js';
import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';
import UserProfile, { ItemAttributes } from '../../interfaces/UserProfile';
import itemList, { ItemKey } from '../itemList';

export const kakisFedState: {
  time: number;
  name: string;
}[] = [
  {
    time: 216_000_000, // 60h
    name: 'Aptaukojies 😎',
  },
  {
    time: 172_800_000, // 48h
    name: 'Pieēdies 😋',
  },
  {
    time: 129_600_000, // 36h
    name: 'Labi paēdis 😃',
  },
  {
    time: 86_400_000, // 24h
    name: 'Apmierināts 🙂',
  },
  {
    time: 43_200_000, // 12h
    name: 'Izsalcis 🥺',
  },
  {
    time: 0,
    name: 'ĻOTI IZSALCIS 😡',
  },
];

// kaķa maksimālais pabarošanas laiks, 3d
export const KAKIS_MAX_FEED = 259_200_000;

export const kakisFoodData: Record<ItemKey, { feedTimeMs: number }> = {
  lidaka: {
    feedTimeMs: 57_600_000, // 16h
  },
  asaris: {
    feedTimeMs: 72_000_000, // 20h
  },
  lasis: {
    feedTimeMs: 86_400_000, // 24h
  },
  // TODO: kaķu barība 48h, 40 lati veikalā
};

export function foodDataPercentage(key: ItemKey) {
  return `(${Math.floor((kakisFoodData[key].feedTimeMs / KAKIS_MAX_FEED) * 100)}%)`;
}

function catFedPercentage(fedUntil: number, currTime: number) {
  return `${Math.round(((fedUntil - currTime) / KAKIS_MAX_FEED) * 100)}%`;
}

function deadTime(createdAt: number, fedUntil: number) {
  return (
    `**${time(new Date(createdAt), 't')}** ${time(new Date(createdAt), 'd')} **―** ` +
    `**${time(new Date(fedUntil), 't')}** ${time(new Date(fedUntil), 'd')}`
  );
}

function embed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  { createdAt, fedUntil, customName }: ItemAttributes,
  currTime: number
) {
  const isDead = fedUntil! < currTime;

  return embedTemplate({
    i,
    color: commandColors.izmantot,
    title: `Izmantot: ${itemString(itemList.kakis, null, true, customName)} ${isDead ? '(miris)' : ''}`,
    description: isDead
      ? `🪦 ${deadTime(createdAt!, fedUntil!)}`
      : `Vecums: **${millisToReadableTime(currTime - createdAt!)}**\n` +
        `Garastāvoklis: **${kakisFedState.find(s => fedUntil! - currTime > s.time)?.name}** ` +
        `(${catFedPercentage(fedUntil!, currTime)})`,
  }).embeds;
}

function components(
  { items }: UserProfile,
  { fedUntil }: ItemAttributes,
  currTime: number,
  selectedFood: ItemKey = ''
): ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] {
  const isDead = fedUntil! < currTime;
  if (isDead) return [];

  const foodInInv = items
    .filter(({ name }) => Object.keys(kakisFoodData).includes(name))
    .sort(
      (a, b) => kakisFoodData[b.name].feedTimeMs / KAKIS_MAX_FEED - kakisFoodData[a.name].feedTimeMs / KAKIS_MAX_FEED
    );

  if (!foodInInv.length) {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Tev nav ar ko pabarot kaķi')
          .setCustomId('_')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      ),
    ];
  }

  if (catFedPercentage(fedUntil!, currTime) === '100%') {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Kaķis ir maksimāli piebarots')
          .setCustomId('_')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      ),
    ];
  }

  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('feed_cat_select')
        .setPlaceholder('Izvēlies ēdienu')
        .addOptions(
          foodInInv.map(({ name, amount }) => {
            const { nameNomVsk, emoji } = itemList[name];
            return {
              label: `${capitalizeFirst(nameNomVsk)} ${foodDataPercentage(name)}`,
              description: `Tev ir ${amount}`,
              value: name,
              emoji: emoji || '❓',
              default: name === selectedFood,
            };
          })
        )
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`Pabarot kaķi`)
        .setCustomId('feed_cat_btn')
        .setStyle(selectedFood ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!selectedFood)
    ),
  ];
}

const kakis: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    text: '',
    custom: async i => {
      let currTime = Date.now();

      const user = await findUser(userId, guildId);
      if (!user) return i.reply(errorEmbed);

      const row = components(user, specialItem!.attributes, currTime);

      const msg = await i.reply({
        content: specialItem!.attributes.fedUntil! < currTime ? undefined : '\u200b',
        embeds: embed(i, specialItem!.attributes, currTime),
        components: row,
        fetchReply: true,
      });

      if (!row.length) return;

      let selectedFood = '';

      await buttonHandler(
        i,
        'izmantot',
        msg,
        async int => {
          const { customId, componentType } = int;

          if (customId === 'feed_cat_select' && componentType === ComponentType.SelectMenu) {
            selectedFood = int.values[0];

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

            const cat = user.specialItems.find(({ _id }) => _id === specialItem?._id);
            if (!cat) {
              int.reply(ephemeralReply('Tavā inventārā vairs nav šis kaķis'));
              return { end: true };
            }

            if (!user.items.find(({ name }) => name === selectedFood)) {
              selectedFood = '';
            }

            return {
              edit: {
                embeds: embed(i, cat.attributes, currTime),
                components: components(user, cat.attributes, currTime, selectedFood),
              },
            };
          }

          if (customId === 'feed_cat_btn' && componentType === ComponentType.Button) {
            if (!selectedFood) return { error: true };

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

            currTime = Date.now();

            const hasFood = user.items.find(({ name }) => name === selectedFood);
            if (!hasFood) {
              int.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemList[selectedFood])}**`));
              return { end: true };
            }

            const catInInv = user.specialItems.find(({ _id }) => _id === specialItem?._id);
            if (!catInInv) {
              int.reply(ephemeralReply(`Šis kaķis vairs nav tavā inventārā`));
              return { end: true };
            }

            if (catInInv.attributes!.fedUntil! < currTime) {
              return {
                edit: {
                  embeds: embed(i, specialItem!.attributes, currTime),
                  components: components(user, specialItem!.attributes, currTime),
                },
                after: async () => {
                  int.reply('Tu nevari pabarot šo kaķi, jo tas tikko nomira :(');
                },
              };
            }

            const { feedTimeMs } = kakisFoodData[selectedFood];
            const { fedUntil } = catInInv.attributes!;

            const newFedUntil = Math.min(currTime + KAKIS_MAX_FEED, feedTimeMs + fedUntil!);

            await addItems(userId, guildId, { [selectedFood]: -1 });
            const res = await editItemAttribute(userId, guildId, catInInv._id!, {
              ...catInInv.attributes!,
              fedUntil: newFedUntil,
            });
            if (!res) return { error: true };

            const { newItem, user: userAfter } = res;

            currTime = Date.now();

            return {
              edit: {
                embeds: embed(i, newItem.attributes, currTime),
                components: components(userAfter, newItem.attributes, currTime),
              },
              after: async () => {
                int.reply(`Tu pabaroji kaķi`);
              },
            };
          }
        },
        60000
      );
    },
  };
};

export default kakis;
