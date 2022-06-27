import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const profilsConfig: ApplicationCommandData = {
  name: 'profils',
  description: 'Apskatīties savu vai kāda lietotāja profilu',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam apskatīt profilu',
      type: ApplicationCommandOptionTypes.USER,
    },
  ],
};

export default profilsConfig;