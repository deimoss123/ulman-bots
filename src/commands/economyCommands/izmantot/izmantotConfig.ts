import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

const izmantotConfig: ApplicationCommandData = {
  name: 'izmantot',
  description: 'Izmantot kādu lietu no inventāra',
  options: [
    {
      name: 'lietas_id',
      description: 'lietas id',
      type: ApplicationCommandOptionTypes.STRING,
      required: true
    }
  ]
}

export default izmantotConfig