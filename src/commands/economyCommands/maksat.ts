import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import latiString from '../../embeds/helpers/latiString';
import errorEmbed from '../../embeds/errorEmbed';
import addLati from '../../economy/addLati';
import ephemeralReply from '../../embeds/ephemeralReply';
import commandColors from '../../embeds/commandColors';

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

    if (target.id === i.user.id) {
      return i.reply(ephemeralReply('Tu nevari maksāt sev'));
    }

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari maksāt Valsts bankai'));
    }

    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    // nepietiek lati
    if (user.lati < latiToAdd) {
      return i.reply(
        embedTemplate({
          i,
          description:
            `Tu nevari maksāt ${latiString(latiToAdd, true)}\n` + `Tev ir ${latiString(user.lati)}`,
        })
      );
    }

    const targetUser = await addLati(target.id, latiToAdd);
    const resUser = await addLati(i.user.id, -latiToAdd);

    if (!targetUser || !resUser) return i.reply(errorEmbed);

    await i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description: `Tu samaksāji <@${target.id}> ${latiString(latiToAdd, true)}`,
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
