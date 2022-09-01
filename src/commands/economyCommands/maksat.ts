import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import latiString from '../../embeds/helpers/latiString';
import errorEmbed from '../../embeds/errorEmbed';
import addLati from '../../economy/addLati';
import ephemeralReply from '../../embeds/ephemeralReply';
import commandColors from '../../embeds/commandColors';

const MAKSAT_NODOKLIS = 0.1;

const maksat: Command = {
  title: 'Maksāt',
  description: 'Pārskaitīt citam lietotājam naudu',
  color: commandColors.maksat,
  data: {
    name: 'maksat',
    description: 'Pārskaitīt citam lietotājam naudu',
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
  async run(i: ChatInputCommandInteraction) {
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

    const totalTax = Math.floor(latiToAdd * MAKSAT_NODOKLIS) || 1;
    const totalToPay = latiToAdd + totalTax;

    // nepietiek lati
    if (user.lati < totalToPay) {
      const maxPay = Math.floor((1 / (1 + MAKSAT_NODOKLIS)) * user.lati);

      return i.reply(
        ephemeralReply(
          `Tu nevari maksāt **${latiToAdd}** + ` +
            `**${totalTax}** (${MAKSAT_NODOKLIS * 100}% nodoklis) = ` +
            `**${latiString(totalToPay, true)}**\n` +
            `Tev ir **${latiString(user.lati)}**` +
            (user.lati > 1
              ? `\n\nLielākā summa ko tu vari vari maksāt ir **${latiString(maxPay)}**`
              : '')
        )
      );
    }

    await addLati(i.client.user!.id, guildId, totalTax);
    const targetUser = await addLati(target.id, guildId, latiToAdd);
    const resUser = await addLati(userId, guildId, -totalToPay);

    if (!targetUser || !resUser) return i.reply(errorEmbed);

    await i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description:
          `Tu samaksāji <@${target.id}> **${latiString(latiToAdd, true)}**\n` +
          `Nodoklis: ${latiString(totalTax)} (${MAKSAT_NODOKLIS * 100}%)`,
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
