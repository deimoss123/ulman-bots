import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const pirktConfig: ApplicationCommandData = {
  name: 'pirkt',
  description: 'Nopirkt preci no veikala',
  options: [
    {
      name: 'nosaukums',
      description: 'Prece ko vēlies nopirkt',
      type: ApplicationCommandOptionTypes.STRING,
      autocomplete: true,
      required: true,
    }, {
      name: 'daudzums',
      description: 'Cik preces pirkt',
      type: ApplicationCommandOptionTypes.INTEGER,
      min_value: 1,
    },
  ],
};

export default pirktConfig;