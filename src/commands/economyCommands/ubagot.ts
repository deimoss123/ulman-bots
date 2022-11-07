import { ChatInputCommandInteraction } from 'discord.js';
import addDailyCooldown from '../../economy/addDailyCooldown';
import addItems from '../../economy/addItems';
import addLati from '../../economy/addLati';
import addTimeCooldown from '../../economy/addTimeCooldown';
import addXp from '../../economy/addXp';
import findUser from '../../economy/findUser';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import xpAddedEmbed from '../../embeds/helpers/xpAddedEmbed';
import Command from '../../interfaces/Command';
import { DailyCooldowns } from '../../interfaces/UserProfile';
import chance, { ChanceValue } from '../../items/helpers/chance';
import countFreeInvSlots from '../../items/helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../../items/itemList';
import intReply from '../../utils/intReply';

interface UbagotRes {
  chance: ChanceValue;
  text: string;
  reward?: Record<ItemKey, number>;
}

const ubagotChances: Record<string, UbagotRes> = {
  nauda: {
    chance: '*',
    text: 'tavā krūzītē iebēra nedaudz latus',
  },
  pudele: {
    chance: '*',
    text: `tavā krūzē tika ielikta **${itemString(itemList.pudele, 1)}**`,
    reward: { pudele: 1 },
  },
  metalluznis: {
    chance: '*',
    text: `tajā pamanījies atrast **${itemString(itemList.metalluznis, 1, true)}**`,
    reward: { metalluznis: 1 },
  },
  piens: {
    chance: 0.1,
    text: `tajā ielija piens, tava krūze pārvērtās par **${itemString(itemList.piena_spainis, null, true)}**`,
    reward: { piena_spainis: 1 },
  },
  kafija: {
    chance: 0.1,
    text: `tavā krūzītē kāds ielējā **${itemString(itemList.kafija, null, true)}**`,
    reward: { kafija: 1 },
  },
  latloto: {
    chance: 0.1,
    text: `kādam garāmgājējam no kabatas izkrita **${itemString(itemList.latloto, 1)}**`,
    reward: { latloto: 1 },
  },
  metalluznis3: {
    chance: 0.05,
    text: `uz zemes atradi **${itemString(itemList.metalluznis, 3, true)}**`,
    reward: { metalluznis: 3 },
  },
};

const MAX_DAILY = 10;

const XP_MIN = 1;
const XP_MAX = 2;

const LATI_MIN = 5;
const LATI_MAX = 10;

const UBAGOT_COOLDOWN = 900_000; // 15 min

function ubagotEmbed(
  i: ChatInputCommandInteraction,
  dailyCooldowns: DailyCooldowns,
  { text, reward }: UbagotRes,
  earnedLati?: number
) {
  return embedTemplate({
    i,
    title: `Ubagot | ${dailyCooldowns.ubagot.timesUsed}/${MAX_DAILY}`,
    description: `Tu pakratīji savu krūzīti un ` + (reward ? text : `saņēmi ${latiString(earnedLati!, true, true)}`),
    color: commandColors.stradat,
  }).embeds![0];
}

const ubagot: Command = {
  description:
    'Žēlīgi krati savu krūzīti un ceri ka kāds iemetīs kādu santīmu\n' +
    `Ubagot var **${MAX_DAILY}** reizes dienā, ` +
    `un komandu var izmantot ik \`${millisToReadableTime(UBAGOT_COOLDOWN)}\``,
  color: commandColors.stradat,
  cooldown: UBAGOT_COOLDOWN,
  data: {
    name: 'ubagot',
    description: 'Ubagot uz ielas',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const { dailyCooldowns } = user;

    if (dailyCooldowns.ubagot.timesUsed >= MAX_DAILY) {
      return intReply(i, ephemeralReply('Tu esi sasniedzis maksimālo ubagošanas daudzumu šodien'));
    }

    if (!countFreeInvSlots(user)) {
      return intReply(i, ephemeralReply('Lai ubagotu tev vajag vismaz vienu brīvu vietu inventārā'));
    }

    const res = chance(ubagotChances);
    const obj = res.obj as UbagotRes;

    let earnedLati = 0;

    await addTimeCooldown(userId, guildId, this.data.name);
    await addDailyCooldown(userId, guildId, 'ubagot');

    if (!obj.reward) {
      earnedLati = Math.floor(Math.random() * (LATI_MAX - LATI_MIN)) + LATI_MIN;
      await addLati(userId, guildId, earnedLati);
    } else {
      await addItems(userId, guildId, obj.reward);
    }

    const xpToAdd = Math.round(Math.random() * (XP_MAX - XP_MIN)) + XP_MIN;

    const leveledUser = await addXp(userId, guildId, xpToAdd);
    if (!leveledUser) return intReply(i, errorEmbed);

    intReply(i, {
      embeds: [
        ubagotEmbed(i, leveledUser.user.dailyCooldowns, obj, earnedLati),
        xpAddedEmbed(leveledUser, xpToAdd, 'Par ubagošanu tu saņēmi'),
      ],
    });
  },
};

export default ubagot;
