import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import latiString from '../../embeds/helpers/latiString';
import errorEmbed from '../../embeds/errorEmbed';
import addLati from '../../economy/addLati';
import ephemeralReply from '../../embeds/ephemeralReply';
import commandColors from '../../embeds/commandColors';
import setStats from '../../economy/stats/setStats';

const maksat: Command = {
  description:
    'Pārskaitīt citam lietotājam latus\n' +
    `Maksājot naudu citam lietotājam ir arī jāmaksā nodoklis - **10%**\n` +
    'Maksāšanas nodokli ir iespējams samazināt sasniedzot noteiktus līmeņus\n' +
    'Savu maksāšanas nodokli var apskatīt ar komandu `/profils`',
  color: commandColors.maksat,
  data: {
    name: 'maksat',
    description: 'Pārskaitīt citam lietotājam latus',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam maksāt',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'latu_daudzums',
        description: 'Cik latus vēlies samaksāt',
        type: ApplicationCommandOptionType.Integer,
        min_value: 1,
        required: true,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser('lietotājs')!;
    const latiToAdd = i.options.getInteger('latu_daudzums')!;

    const userId = i.user.id;
    const guildId = i.guildId!;

    if (target.id === i.user.id) {
      return i.reply(ephemeralReply('Tu nevari maksāt sev'));
    }

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari maksāt Valsts bankai'));
    }

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const hasJuridisks = user.status.juridisks > Date.now();

    const totalTax = hasJuridisks ? 0 : Math.floor(latiToAdd * user.payTax) || 1;
    const totalToPay = latiToAdd + totalTax;

    // nepietiek lati
    if (user.lati < totalToPay) {
      const maxPay = Math.floor((1 / (1 + user.payTax)) * user.lati);

      return i.reply(
        ephemeralReply(
          `Tu nevari maksāt **${latiToAdd}** + ` +
            `**${totalTax}** (${user.payTax * 100}% nodoklis) = ` +
            `**${latiString(totalToPay, true)}**\n` +
            `Tev ir **${latiString(user.lati)}**` +
            (user.lati > 1 ? `\n\nLielākā summa ko tu vari vari maksāt ir **${latiString(maxPay)}**` : '')
        )
      );
    }

    const promises = [
      addLati(target.id, guildId, latiToAdd),
      addLati(userId, guildId, -totalToPay),
      setStats(target.id, guildId, { receivedLati: latiToAdd }),
      setStats(userId, guildId, { paidLati: latiToAdd, taxPaid: totalTax }),
    ];
    if (!hasJuridisks) promises.push(addLati(i.client.user!.id, guildId, totalTax));

    const [targetUser, resUser] = await Promise.all(promises);
    if (!targetUser || !resUser) return i.reply(errorEmbed);

    i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description:
          `Tu samaksāji <@${target.id}> **${latiString(latiToAdd, true)}**\n` +
          `Nodoklis: ` +
          (hasJuridisks ? '0 lati (juridiska persona)' : `${latiString(totalTax)} (${user.payTax * 100}%)`),
        color: this.color,
        fields: [
          {
            name: 'Tev palika',
            value: latiString(resUser.lati),
            inline: true,
          },
          {
            name: 'Tagad viņam ir',
            value: latiString(targetUser.lati),
            inline: true,
          },
        ],
      })
    );
  },
};

export default maksat;
