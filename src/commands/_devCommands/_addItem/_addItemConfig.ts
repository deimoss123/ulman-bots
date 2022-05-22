import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const _addItemConfig: ApplicationCommandData = {
  name: 'additem',
  description: 'Pievienot mantu inventārā',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam pievienot lietu',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: 'nosaukums',
      description: 'Kādu lietu pievienot',
      type: ApplicationCommandOptionTypes.STRING,
      autocomplete: true,
      required: true,
    }, {
      name: 'daudzums',
      description: 'Cik lietas pievienot',
      type: ApplicationCommandOptionTypes.INTEGER,
      required: true,
    },
  ],
};

export default _addItemConfig;