import addDailyCooldown from '../../economy/addDailyCooldown';
import addLati from '../../economy/addLati';
import addXp from '../../economy/addXp';
import findUser from '../../economy/findUser';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import latiString from '../../embeds/helpers/latiString';
import xpAddedEmbed from '../../embeds/helpers/xpAddedEmbed';
import smallEmbed from '../../embeds/smallEmbed';
import Command from '../../interfaces/Command';
import intReply from '../../utils/intReply';

const okddInv = '<https://discord.gg/F4s5AwYTMy>';
const okddId = '797584379685240882';

const PABALSTS_XP = 5;
const PABALSTS_LATI = 50;

const pabalsts: Command = {
  description:
    '**OkDraudziņDauni serverim ekskluzīva komanda**\n' +
    `Pabalsts ir saņemams vienu reizi dienā, tas dod ` +
    `${latiString(PABALSTS_LATI, true, true)} un **${PABALSTS_XP}** UlmaņPunktus`,
  color: commandColors.pabalsts,
  data: {
    name: 'pabalsts',
    description: 'Saņemt ikdienas draudziņu pabalstu',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    if (guildId !== okddId) {
      return intReply(
        i,
        smallEmbed(
          `Ikdienas pabalstu var saņemt tikai servera "OkDraudziņDauni" biedri\n` +
            `Ja vēlies pievienoties aktīvākajam UlmaņBota serverim, kā arī saņemt pabalstu, spied šeit: ${okddInv}`,
          this.color
        )
      );
    }

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const { dailyCooldowns } = user;

    if (dailyCooldowns.pabalsts.timesUsed >= 1) {
      return intReply(i, ephemeralReply('Tu vari saņemt pabalstu tikai **1** (vienu) reizi dienā'));
    }

    await addLati(userId, guildId, PABALSTS_LATI);
    await addDailyCooldown(userId, guildId, 'pabalsts');

    const leveledUser = await addXp(userId, guildId, PABALSTS_XP);
    if (!leveledUser) return intReply(i, errorEmbed);

    intReply(i, {
      embeds: [
        embedTemplate({
          i,
          color: this.color,
          title: 'Pabalsts',
          description: `Tu saņemi ikdienas draudziņu pabalstu - ${latiString(PABALSTS_LATI, true, true)}`,
        }).embeds![0],
        xpAddedEmbed(leveledUser, PABALSTS_XP, 'Tu papildus saņēmi'),
      ],
    });
  },
};

export default pabalsts;
