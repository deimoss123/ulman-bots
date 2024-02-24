import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
} from 'discord.js';
import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import removeItemsById from '../../economy/removeItemsById';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import iconEmojis from '../../embeds/iconEmojis';
import { UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import chance, { ChanceObj, ChanceRecord } from '../helpers/chance';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import buttonHandler from '../../embeds/buttonHandler';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';

const fishCountChance: ChanceRecord = {
  3: { chance: '*' }, // 0.25
  4: { chance: '*' }, // 0.25
  5: { chance: 0.2 },
  6: { chance: 0.15 },
  7: { chance: 0.1 },
  8: { chance: 0.05 },
};

export function generateFishCount() {
  return +chance(fishCountChance).key;
}

const lotoFishChanceObj: Record<ItemKey, ChanceObj> = {
  lidaka: { chance: '*' },
  asaris: { chance: '*' },
  lasis: { chance: '*' },
  petniekzivs: { chance: 0.15 },
  juridiska_zivs: { chance: 0.1 },
  divaina_zivs: { chance: 0.1 },
};

const lotoZivsSpinEmoji = '<a:loto_zivs_spin:1032080231097450567>';

function lotoZivsEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  wonFishArr: ItemKey[],
  wonFishObj: Record<ItemKey, number>,
  spinning = false,
) {
  const { emptyEmoji, arrow_1_left, arrow_1_right, arrow_2_left, arrow_2_right } = iconEmojis;

  return embedTemplate({
    i,
    color: spinning ? commandColors.feniks : 0xf080ff,
    title: `Izmantot: ${itemString(itemList.loto_zivs, null, true)} (satur ${wonFishArr.length} zivis)`,
    description:
      (spinning ? arrow_1_right : arrow_2_right) +
      emptyEmoji +
      (spinning
        ? Array(wonFishArr.length).fill(lotoZivsSpinEmoji)
        : wonFishArr.map(key => {
            const { emoji } = itemList[key];
            return `<${emoji?.animated ? 'a' : ''}:${emoji?.name}:${emoji?.id}>`;
          })
      ).join(' ') +
      emptyEmoji +
      (spinning ? arrow_1_left : arrow_2_left),
    fields: spinning
      ? []
      : [
          {
            name: 'Tu laimēji:',
            value: Object.entries(wonFishObj)
              .map(([key, amount]) => itemString(itemList[key], amount, true))
              .join('\n'),
            inline: true,
          },
        ],
  }).embeds!;
}

function lotoZivsComponents(lotoZivis: SpecialItemInProfile[], disabled = false, selectedId = '') {
  if (!lotoZivis.length) return [];

  const itemObj = itemList.loto_zivs;

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('loto_zivs_izmantot_velreiz_select')
      .setPlaceholder('Izmantot vēlreiz')
      .setDisabled(disabled)
      .setOptions(
        lotoZivis
          .slice(0, 25)
          .sort((a, b) => b.attributes.holdsFishCount! - a.attributes.holdsFishCount!)
          .map(item => ({
            label: capitalizeFirst(itemObj.nameNomVsk),
            description: displayAttributes(item, true),
            emoji: itemObj.emoji || '❓',
            value: item._id!,
            default: selectedId === item._id,
          })),
      ),
  );

  return [row];
}

const loto_zivs: UsableItemFunc = (userId, guildId, _, specialItem) => {
  return {
    custom: async (i, color) => {
      const holdsFishCount = specialItem!.attributes.holdsFishCount!;

      const user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const freeSlots = countFreeInvSlots(user);

      if (freeSlots < holdsFishCount - 1) {
        return intReply(
          i,
          ephemeralReply(
            `Lai izmantotu ${itemString(itemList.loto_zivs, null, true)} kas satur **${holdsFishCount}** zivis, ` +
              `tev inventārā ir jābūt vismaz **${holdsFishCount - 1}** brīvām vietām\n` +
              `Tev ir ${freeSlots} brīvas vietas`,
          ),
        );
      }

      const wonFishObj: Record<ItemKey, number> = {};
      const wonFishArr: ItemKey[] = [];
      for (let i = 0; i < holdsFishCount; i++) {
        const { key } = chance(lotoFishChanceObj);
        wonFishArr.push(key);
        wonFishObj[key] = wonFishObj[key] ? wonFishObj[key] + 1 : 1;
      }

      await addItems(userId, guildId, { ...wonFishObj });
      const userNew = await removeItemsById(userId, guildId, [specialItem!._id!]);
      if (!userNew) return intReply(i, errorEmbed);

      const fishInInv = userNew.specialItems.filter(item => item.name === 'loto_zivs');

      const msg = await intReply(i, {
        embeds: lotoZivsEmbed(i, wonFishArr, wonFishObj, true),
        components: lotoZivsComponents(fishInInv, true),
        fetchReply: true,
      });

      let isSpinning = true;

      setTimeout(() => {
        isSpinning = false;
        i.editReply({
          embeds: lotoZivsEmbed(i, wonFishArr, wonFishObj),
          components: lotoZivsComponents(fishInInv),
        }).catch(_ => _);
      }, 1000);

      if (!msg || !fishInInv.length) return;

      buttonHandler(
        i,
        'izmantot_loto_zivs',
        msg,
        async int => {
          const { customId, componentType } = int;

          if (isSpinning || componentType !== ComponentType.StringSelect) return;

          const user = await findUser(userId, guildId);
          if (!user) return { error: true };

          if (customId === 'loto_zivs_izmantot_velreiz_select') {
            const itemId = int.values[0];
            const itemInInv = user.specialItems.find(item => item._id === itemId);

            if (!itemInInv) {
              intReply(
                int,
                ephemeralReply(
                  `Tavs inventāra saturs ir mainījies, šī **${itemString('loto_zivs')}** vairs nav tavā inventārā`,
                ),
              );
              return { end: true };
            }

            return {
              edit: {
                components: lotoZivsComponents(fishInInv, true, itemId),
              },
              end: true,
              after: async () => {
                const useRes = await loto_zivs(userId, guildId, 'loto_zivs', itemInInv);

                // @ts-ignore būs labi :^)
                useRes.custom(int, color);
              },
            };
          }
        },
        20000,
      );
    },
  };
};

export default loto_zivs;
