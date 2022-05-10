import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const iedotConfig: ApplicationCommandData = {
  name: 'iedot',
  description: 'Iedot citam lietotājam kādu lietu',
  options: [
    {
      name: 'lietotājs',
      description: 'Lietotājs kam iedot',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: 'lietas_id',
      description: 'Lietas id',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    }, {
      name: 'daudzums',
      description: 'Cik daudz dot',
      type: ApplicationCommandOptionTypes.INTEGER,
      min_value: 1,
    },
  ],
};

export default iedotConfig;