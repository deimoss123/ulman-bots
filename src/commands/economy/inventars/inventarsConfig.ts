import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const inventarsConfig: ApplicationCommandData = {
  name: 'inv',
  description: 'Apskatīt inventāru',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam apskatīt inventāru',
      type: ApplicationCommandOptionTypes.USER,
    },
  ],
};

export default inventarsConfig;