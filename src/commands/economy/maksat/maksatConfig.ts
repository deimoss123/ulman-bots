import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const maksatConfig: ApplicationCommandData = {
  name: 'maksāt',
  description: 'Pārskaitīt citam lietotājam naudu',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam maksāt',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: 'latu_daudzums',
      description: 'Cik latus vēlies samaksāt',
      type: ApplicationCommandOptionTypes.INTEGER,
      min_value: 1,
      required: true,
    },
  ],
};

export default maksatConfig;