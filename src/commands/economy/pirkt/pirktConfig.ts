import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const pirktConfig: ApplicationCommandData = {
  name: 'pirkt',
  description: 'Nopirkt preci no veikala',
  options: [
    {
      name: 'preces_id',
      description: 'Preces id',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    }, {
      name: 'daudzums',
      description: 'Cik preces pirkt (ja neievadi tad būs 1)',
      type: ApplicationCommandOptionTypes.INTEGER,
      min_value: 1,
    },
  ],
};

export default pirktConfig;