import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const pirktConfig: ApplicationCommandData = {
  name: 'pirkt',
  description: 'Nopirkt preci no veikala',
  options: [
    {
      name: 'preces_nosaukums',
      description: 'Preces id',
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