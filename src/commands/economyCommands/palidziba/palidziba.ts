import { ApplicationCommandOptionType } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import intReply from '../../../utils/intReply';
import { commandList } from '../../commandList';
import jaunumi from './jaunumi/jaunumi';

export function getPalidzibaChoices() {
  return commandList
    .filter(cmd => cmd.data.name !== 'palidziba')
    .sort((a, b) => (a.data.name > b.data.name ? 1 : -1))
    .map(({ data }) => ({ name: `❔ ${data.name}`, value: data.name }));
}

const palidziba: Command = {
  description: '???',
  color: commandColors.info,
  data: {
    name: 'palidziba',
    description: 'Iegūt informāciju par komandām un dažādām UlmaņBota sistēmām',
    options: [
      {
        name: 'jaunumi',
        description: 'Kas jauns UlmaņBota atjauninājumos',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'komanda',
        description: 'Iegūt informāciju par kādu komandu',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'nosaukums',
            description: 'Komandas nosaukums',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [], // ja
          },
        ],
      },
    ],
  },
  async run(i) {
    const subCommand = i.options.getSubcommand();

    switch (subCommand) {
      case 'komanda': {
        const cmdName = i.options.getString('nosaukums');
        const cmd = commandList.find(c => c.data.name === cmdName);
        if (!cmd) return intReply(i, errorEmbed);

        return intReply(
          i,
          embedTemplate({
            i,
            color: this.color,
            title: `Palīdzība - /${cmdName}`,
            description: cmd.description,
          })
        );
      }
      case 'jaunumi':
        return jaunumi(i);
    }
  },
};

export default palidziba;
