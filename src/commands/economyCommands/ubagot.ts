import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
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
import xpAddedText from '../../embeds/helpers/xpAddedText';
import Command from '../../interfaces/Command';
import { DailyCooldowns } from '../../interfaces/UserProfile';

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
  cooldown: 1_800_000, // 30 min
  data: {
    name: 'ubagot',
    description: 'Ubagot uz ielas',
  },
  async run(i) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const { dailyCooldowns } = user;

    if (dailyCooldowns.ubagot.timesUsed >= MAX_DAILY) {
      return i.reply(ephemeralReply('Tu esi sasniedzis maksimālo ubagošanas daudzumu šodien'));
    }

    const earnedLati = Math.floor(Math.random() * (LATI_MAX - LATI_MIN)) + LATI_MIN;
    const xpToAdd = Math.round(Math.random() * (XP_MAX - XP_MIN)) + XP_MIN;

    await addLati(i.user.id, earnedLati);
    await addTimeCooldown(i.user.id, this.data.name);
    await addDailyCooldown(i.user.id, 'ubagot');

    const leveledUser = await addXp(i.user.id, xpToAdd);
    if (!leveledUser) return i.reply(errorEmbed);

    await i.reply({
      embeds: [
        ubagotEmbed(i, leveledUser.user.dailyCooldowns, earnedLati, this.color),
        new EmbedBuilder()
          .setDescription(xpAddedText(leveledUser, xpToAdd, 'Par ubagošanu tu saņēmi'))
          .setColor(0xffffff),
      ],
    });
  },
};
export default ubagot;
