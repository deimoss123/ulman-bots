import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const _addXPConfig: ApplicationCommandData = {
  name: 'addxp',
  description: 'Pievienot UlmaņPunktus',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam pievienot UlmaņPunktus',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: 'daudzums',
      description: 'Cik UlmaņPunktus pievienot',
      type: ApplicationCommandOptionTypes.INTEGER,
      required: true,
    },
  ],
};

export default _addXPConfig;