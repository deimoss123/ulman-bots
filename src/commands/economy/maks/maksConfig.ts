import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const maksConfig: ApplicationCommandData = {
  name: 'maks',
  description: 'Apskatīties maku',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam apskatīt maku',
      type: ApplicationCommandOptionTypes.USER,
    },
  ],
};

export default maksConfig;