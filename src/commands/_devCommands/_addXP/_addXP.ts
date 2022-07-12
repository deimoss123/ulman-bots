import Command from '../../../interfaces/Command';
import _addXPConfig from './_addXPConfig';
import { CommandInteraction } from 'discord.js';
import errorEmbed from '../../../embeds/errorEmbed';
import embedTemplate from '../../../embeds/embedTemplate';
import addXp from '../../../economy/addXp';
import latiString from '../../../embeds/helpers/latiString';

const _addXP: Command = {
  title: 'AddXP',
  description: 'Pievienot UlmaņPunktus',
  color: '#fff',
  config: _addXPConfig,
  async run(i: CommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const xpToAdd = i.options.getInteger('daudzums')!;

    const leveledUser = await addXp(target.id, xpToAdd);
    if (!leveledUser) return i.reply(errorEmbed);

    const { user, levelIncrease, maxLevelReward } = leveledUser;

    await i.reply(
      embedTemplate({
        i,
        description:
          `<@${target.id}> tika pievienoti ${xpToAdd} UlmaņPunkti\n` +
          `Līmenis: ${user.level}, UlmaņPunkti: ${user.xp}\n` +
          (levelIncrease
            ? `Palielināts līmenis **${levelIncrease.from}** -> **${levelIncrease.to}**\n`
            : '') +
          (maxLevelReward ? `Maksimālā līmeņa bonuss: **${latiString(maxLevelReward)}**` : ''),
        color: this.color,
      })
    );
  },
};

export default _addXP;
