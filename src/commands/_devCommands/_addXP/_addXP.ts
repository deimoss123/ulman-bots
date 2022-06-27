import Command from '../../../interfaces/Command';
import _addXPConfig from './_addXPConfig';
import { CommandInteraction } from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import embedTemplate from '../../../embeds/embedTemplate';
import addXp from '../../../economy/addXp';

const _addXP: Command = {
  title: 'AddXP',
  description: 'Pievienot UlmaņPunktus',
  color: '#ffffff',
  config: _addXPConfig,
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!;
    const xpToAdd = i.options.data[1].value as number;

    const targetUser = await findUser(target.id);
    if (!targetUser) return i.reply(errorEmbed);

    await addXp(target.id, xpToAdd)

    await i.reply(embedTemplate({
      i,
      description:
        `<@${target.id}> tika pievienoti ${xpToAdd} UlmaņPunkti\n` +
        `Tagad viņam ir ${targetUser.xp + xpToAdd} UlmaņPunkti`,
      color: this.color,
    }));
  },
};

export default _addXP;