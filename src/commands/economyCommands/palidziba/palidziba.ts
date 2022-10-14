import { ApplicationCommandOptionType } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate, { ULMANBOTA_VERSIJA } from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import { commandList } from '../../commandList';
import updatesList from './updatesList';

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
      {
        name: 'jaunumi',
        description: 'Kas jauns UlmaņBota atjauninājumos',
        type: ApplicationCommandOptionType.Subcommand,
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
      case 'jaunumi': {
        return i.reply(
          embedTemplate({
            i,
            color: this.color,
            title: 'Palīdzība - jaunumi',
            fields: [
              {
                name: `Versija: ${ULMANBOTA_VERSIJA}, datums: ${updatesList[ULMANBOTA_VERSIJA].date}`,
                value: updatesList[ULMANBOTA_VERSIJA].description,
                inline: false,
              },
              ...updatesList[ULMANBOTA_VERSIJA].fields,
            ],
          })
        );
      }
    }
  },
};

export default palidziba;
