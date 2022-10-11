import { ApplicationCommandOptionType } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import { commandList } from '../../commandList';

export function getPalidzibaChoices() {
  return commandList
    .filter(cmd => cmd.data.name !== 'palidziba')
    .sort((a, b) => (a.data.name > b.data.name ? 1 : -1))
    .map(({ data }) => ({ name: `❔ ${data.name}`, value: data.name }));
}

const palidziba: Command = {
  description: '???',
  color: 0xffffff,
  data: {
    name: 'palidziba',
    description: 'Iegūt informāciju par komandām un dažādām UlmaņBota sistēmām',
    options: [
      {
        name: 'par_ulmaņbotu',
        description: 'Īsa pamācība kā izmantot UlmaņBotu',
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
        if (!cmd) return i.reply(errorEmbed);

        return i.reply(
          embedTemplate({
            i,
            color: this.color,
            title: `Palīdzība - /${cmdName}`,
            description: cmd.description,
          })
        );
      }
    }
  },
};

export default palidziba;
