import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const pardotConfig: ApplicationCommandData = {
  name: 'pārdot',
  description: 'Pārdot lietu no sava inventāra',
  options: [
    {
      name: 'vienu',
      description: 'Pārdot vienu lietu pēc id',
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'nosaukums',
          description: 'Lieta ko vēlies pārdot',
          type: ApplicationCommandOptionTypes.STRING,
          autocomplete: true,
          required: true,
        }, {
          name: 'daudzums',
          description: 'Cik daudz lietas vēlies pārdot',
          type: ApplicationCommandOptionTypes.INTEGER,
          min_value: 1,
        },
      ],
    }, {
      name: 'pēc_tipa',
      description: 'Pārdot visas lietas pēc tipa (zivis, atkritumi, utt.)',
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'tips',
          description: 'Kāda tipa lietas pārdot',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
          choices: [
            {
              name: 'Atkritumi',
              value: 'atkritumi',
            }, {
              name: 'Zivis',
              value: 'zivis',
            }, {
              name: 'Visu',
              value: 'visu',
            },
          ],
        },
      ],
    },
  ],
};

export default pardotConfig;