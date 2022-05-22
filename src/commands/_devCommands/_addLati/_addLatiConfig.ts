import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const _addLatiConfig: ApplicationCommandData = {
  name: 'addlati',
  description: 'Pievienot latus',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam pievienot latus',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: 'latu_daudzums',
      description: 'Cik latus pievienot',
      type: ApplicationCommandOptionTypes.INTEGER,
      required: true,
    },
  ],
};

export default _addLatiConfig;