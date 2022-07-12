import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import addLati from '../../../economy/addLati';
import _addLatiConfig from './_addLatiConfig';

const _addLati: Command = {
  title: 'AddLati',
  description: 'Pievienot latus',
  color: '#ffffff',
  config: _addLatiConfig,
  async run(i: CommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const latiToAdd = i.options.getInteger('latu_daudzums')!;

    const targetUser = await findUser(target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    await i.reply(
      embedTemplate({
        i,
        description:
          `<@${target.id}> tika pievienoti ${latiString(latiToAdd)}\n` +
          `Tagad viņam ir ${latiString(targetUser.lati + latiToAdd)}`,
        color: this.color,
      })
    );

    await addLati(target.id, latiToAdd);
  },
};

export default _addLati;
