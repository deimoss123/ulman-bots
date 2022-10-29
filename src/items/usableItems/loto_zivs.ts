import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
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
import chance, { ChanceObj, ChanceRecord } from '../helpers/chance';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';

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
  spinning = false
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
  });
}

const loto_zivs: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    text: '',
    custom: async i => {
      const holdsFishCount = specialItem!.attributes.holdsFishCount!;

      const user = await findUser(userId, guildId);
      if (!user) return i.reply(errorEmbed);

      const freeSlots = countFreeInvSlots(user);

      if (freeSlots < holdsFishCount - 1) {
        return i.reply(
          ephemeralReply(
            `Lai izmantotu ${itemString(itemList.loto_zivs, null, true)} kas satur **${holdsFishCount}** zivis, ` +
              `tev inventārā ir jābūt vismaz **${holdsFishCount - 1}** brīvām vietām\n` +
              `Tev ir ${freeSlots} brīvas vietas`
          )
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
      await removeItemsById(userId, guildId, [specialItem!._id!]);
      await i.reply(lotoZivsEmbed(i, wonFishArr, wonFishObj, true));

      setTimeout(() => i.editReply(lotoZivsEmbed(i, wonFishArr, wonFishObj)), 2000);
    },
  };
};

export default loto_zivs;
