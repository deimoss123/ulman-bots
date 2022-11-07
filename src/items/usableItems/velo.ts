import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import addItems from '../../economy/addItems';
import addXp from '../../economy/addXp';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import xpAddedEmbed from '../../embeds/helpers/xpAddedEmbed';
import iconEmojis from '../../embeds/iconEmojis';
import { UsableItemFunc } from '../../interfaces/Item';
import { ItemInProfile } from '../../interfaces/UserProfile';
import itemList, { ItemKey } from '../itemList';

const VELO_XP = 10;

export const veloInfo =
  'Šī ir viena no 4 nepieciešajām detaļām lai sataisītu **Velosipēdu**\n' +
  `Velosipēda sataisīšana pievienos tavam inventāram velospēdu, kā arī tu iegūsi **${VELO_XP}** UlmaņPunktus`;

const requiredItems: Record<ItemKey, number> = {
  velo_ramis: 1,
  velo_ritenis: 2,
  velo_kede: 1,
  velo_sture: 1,
};

function makeEmbed(i: CommandInteraction | ButtonInteraction, reqItemsInv: Record<ItemKey, number>, color: number) {
  const maxLength = Math.max(...Object.values(reqItemsInv)).toString().length;

  return embedTemplate({
    i,
    description: `Ar velosipēda detaļām tu vari sataisīt **${itemString(itemList['velosipeds'], null, true)}**`,
    fields: [
      {
        name: 'Nepieciešamās detaļas:',
        value: Object.entries(reqItemsInv)
          .map(([key, amount]) => {
            return (
              `${amount >= requiredItems[key] ? iconEmojis.checkmark : iconEmojis.cross} ` +
              `\` ${' '.repeat(maxLength - `${amount}`.length)}${amount}/${requiredItems[key]} \` ` +
              itemString(itemList[key])
            );
          })
          .join('\n'),
        inline: false,
      },
    ],
    color,
  }).embeds!;
}

function calcReqItems(items: ItemInProfile[]) {
  const reqItemsInv: Record<ItemKey, number> = {};
  let hasAll = true;

  for (const [key, amount] of Object.entries(requiredItems)) {
    const amountInInv = items.find(i => i.name === key)?.amount ?? 0;
    reqItemsInv[key] = amountInInv;
    if (amountInInv < amount) hasAll = false;
  }

  return {
    items: reqItemsInv,
    hasAll,
  };
}

function makeComponents(hasAll: boolean) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('izveidot_velosipedu')
        .setLabel('Sataisīt velosipēdu')
        .setStyle(hasAll ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!hasAll)
    ),
  ];
}

const velo: UsableItemFunc = async (userId, guildId) => {
  return {
    custom: async (i, color) => {
      const user = await findUser(userId, guildId);
      if (!user) return i.reply(errorEmbed);

      const reqItemsInv = calcReqItems(user.items);

      const msg = await i.reply({
        embeds: makeEmbed(i, reqItemsInv.items, color),
        components: makeComponents(reqItemsInv.hasAll),
        fetchReply: true,
      });

      await buttonHandler(
        i,
        'izmantot_velo',
        msg,
        async interaction => {
          const { customId } = interaction;
          if (interaction.componentType !== ComponentType.Button) return;

          if (customId === 'izveidot_velosipedu') {
            const user = await findUser(userId, guildId);
            if (!user) return;

            const { hasAll } = calcReqItems(user.items);
            if (!hasAll) {
              await interaction.reply(ephemeralReply('Tev nav nepieciešamās detaļas, inventāra saturs ir mainījies'));
              return {
                end: true,
              };
            }

            const itemsToRemove: Record<ItemKey, number> = {};
            for (const [key, value] of Object.entries(requiredItems)) {
              itemsToRemove[key] = -value;
            }

            const userAfter = await addItems(userId, guildId, { ...itemsToRemove, velosipeds: 1 });
            const userAfterXP = await addXp(userId, guildId, VELO_XP);
            if (!userAfter || !userAfterXP) {
              await interaction.reply(errorEmbed);
              return;
            }

            const { items: items2, hasAll: hasAll2 } = calcReqItems(userAfter.items);

            return {
              edit: {
                embeds: makeEmbed(i, items2, color),
                components: makeComponents(hasAll2),
              },
              after: async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setDescription(
                        `No velosipēda detaļām tu sataisīji **${itemString(itemList.velosipeds, 1, true)}**`
                      )
                      .setColor(color),
                    xpAddedEmbed(userAfterXP, VELO_XP, 'Par velosipēda sataisīšanu tu ieguvi'),
                  ],
                });
              },
            };
          }
        },
        30_000
      );
    },
  };
};

export default velo;
