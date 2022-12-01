import { ButtonInteraction } from 'discord.js';
import addItems from '../economy/addItems';
import addLati from '../economy/addLati';
import findUser from '../economy/findUser';
import setUser from '../economy/setUser';
import ephemeralReply from '../embeds/ephemeralReply';
import errorEmbed from '../embeds/errorEmbed';
import itemString from '../embeds/helpers/itemString';
import latiString from '../embeds/helpers/latiString';
import checkUserSpecialItems from '../items/helpers/checkUserSpecialItems';
import countFreeInvSlots from '../items/helpers/countFreeInvSlots';
import intReply from '../utils/intReply';
import calendarRewards from './calendarRewards';

export default async function handleAdventeButton(i: ButtonInteraction) {
  const date = new Date();

  if (date.getMonth() !== 11 || date.getDate() > 24) {
    return intReply(i, ephemeralReply('Šī gada adventes kalendārs ir beidzies'));
  }

  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  if (user.adventeClaimedDate === date.toLocaleDateString('en-GB')) {
    return intReply(i, ephemeralReply(`Tu jau esi saņēmis šodienas dāvanu`));
  }

  const reward = calendarRewards[`${date.getDate()}`];
  if (!reward) return intReply(i, errorEmbed);

  if ('item' in reward) {
    const { item, amount } = reward;
    if (countFreeInvSlots(user) < amount) {
      return intReply(
        i,
        ephemeralReply(
          `Tev nepietiek vietas inventārā lai saņemtu **${itemString(item, amount, true)}**\n` +
            `Tev ir ${countFreeInvSlots(user)} brīvas vietas`
        )
      );
    }
    const checkRes = checkUserSpecialItems(user, item, amount);
    if (!checkRes.valid) {
      return intReply(i, ephemeralReply(`Neizdevās saņemt dāvanu, jo ${checkRes.reason}`));
    }

    await addItems(userId, guildId, { [item]: amount });
  } else {
    await addLati(userId, guildId, reward.lati);
  }

  await setUser(userId, guildId, { adventeClaimedDate: date.toLocaleDateString('en-GB') });

  intReply(i, {
    ephemeral: true,
    embeds: [
      {
        title: `Adventes kalendārs - ${date.toLocaleDateString('en-GB')}`,
        description:
          `Tu saņēmi šodienas dāvanu - ` +
          `**${'item' in reward ? itemString(reward.item, reward.amount, true) : latiString(reward.lati, true)}**`,
        color: 0x00ee00,
      },
    ],
  });
}
