import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const izmantotConfig: ApplicationCommandData = {
  name: 'izmantot',
  description: 'Izmantot kādu lietu no inventāra',
  options: [
    {
      name: 'nosaukums',
      description: 'Lieta ko izmantot',
      type: ApplicationCommandOptionTypes.STRING,
      autocomplete: true,
      required: true,
    },
  ],
};

export default izmantotConfig;