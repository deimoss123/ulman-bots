import { ChatInputCommandInteraction } from 'discord.js';
import addDailyCooldown from '../../economy/addDailyCooldown';
import addLati from '../../economy/addLati';
import addTimeCooldown from '../../economy/addTimeCooldown';
import addXp from '../../economy/addXp';
import findUser from '../../economy/findUser';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import latiString from '../../embeds/helpers/latiString';
import xpAddedEmbed from '../../embeds/helpers/xpAddedEmbed';
import Command from '../../interfaces/Command';
import { DailyCooldowns } from '../../interfaces/UserProfile';
import countFreeInvSlots from '../../items/helpers/countFreeInvSlots';

const MAX_DAILY = 10;

const XP_MIN = 1;
const XP_MAX = 2;

const LATI_MIN = 5;
const LATI_MAX = 10;

function ubagotEmbed(
  i: ChatInputCommandInteraction,
  dailyCooldowns: DailyCooldowns,
  earnedLati: number,
  color: number
) {
  return embedTemplate({
    i,
    title: `Ubagot | ${dailyCooldowns.ubagot.timesUsed}/${MAX_DAILY}`,
    description: `No ubagošanas tu ieguvi **${latiString(earnedLati, true)}**`,
    color,
  }).embeds![0];
}

const ubagot: Command = {
  title: 'Ubagot',
  description: 'Ubagot uz ielas',
  color: commandColors.stradat,
  cooldown: 1_200_000, // 20 min
  data: {
    name: 'ubagot',
    description: 'Ubagot uz ielas',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const { dailyCooldowns } = user;

    if (dailyCooldowns.ubagot.timesUsed >= MAX_DAILY) {
      return i.reply(ephemeralReply('Tu esi sasniedzis maksimālo ubagošanas daudzumu šodien'));
    }

    if (!countFreeInvSlots(user)) {
      return i.reply(ephemeralReply('Lai ubagotu tev vajag vismaz vienu brīvu inventāra slotu'));
    }

    const earnedLati = Math.floor(Math.random() * (LATI_MAX - LATI_MIN)) + LATI_MIN;
    const xpToAdd = Math.round(Math.random() * (XP_MAX - XP_MIN)) + XP_MIN;

    await addLati(userId, guildId, earnedLati);
    await addTimeCooldown(userId, guildId, this.data.name);
    await addDailyCooldown(userId, guildId, 'ubagot');

    const leveledUser = await addXp(userId, guildId, xpToAdd);
    if (!leveledUser) return i.reply(errorEmbed);

    await i.reply({
      embeds: [
        ubagotEmbed(i, leveledUser.user.dailyCooldowns, earnedLati, this.color),
        xpAddedEmbed(leveledUser, xpToAdd, 'Par ubagošanu tu saņēmi'),
      ],
    });
  },
};

export default ubagot;
