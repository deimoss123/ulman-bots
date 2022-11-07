import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import embedTemplate from '../../embeds/embedTemplate';
import latiString from '../../embeds/helpers/latiString';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import addLati from '../../economy/addLati';
import intReply from '../../utils/intReply';

const _addLati: Command = {
  description: 'Pievienot latus',
  color: 0xffffff,
  data: {
    name: 'addlati',
    description: 'Pievienot latus',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam pievienot latus',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'latu_daudzums',
        description: 'Cik latus pievienot',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser('lietotājs')!;
    const latiToAdd = i.options.getInteger('latu_daudzums')!;

    const targetUser = await findUser(target.id, i.guildId!);
    if (!targetUser) {
      return intReply(i, errorEmbed);
    }

    await addLati(target.id, i.guildId!, latiToAdd);

    intReply(
      i,
      embedTemplate({
        i,
        description:
          `<@${target.id}> tika pievienoti ${latiString(latiToAdd)}\n` +
          `Tagad viņam ir ${latiString(targetUser.lati + latiToAdd)}`,
        color: this.color,
      })
    );
  },
};

export default _addLati;
