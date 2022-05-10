import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ApplicationCommandData } from 'discord.js';

const pardotConfig: ApplicationCommandData = {
  name: 'pārdot',
  description: 'Pārdot mantu no sava inventāra',
  options: [
    {
      name: 'vienu',
      description: 'Pārdot vienu mantu pēc id',
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'mantas_id',
          description: 'Mantas id',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
        }, {
          name: 'daudzums',
          description: 'Cik daudz mantas vēlies pārdot',
          type: ApplicationCommandOptionTypes.INTEGER,
          min_value: 1,
        },
      ],
    }, {
      name: 'pēc_tipa',
      description: 'Pārdot visas mantas pēc tipa (zivis, atkritumi, utt.)',
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'tips',
          description: 'Kāda tipa mantas pārdot',
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