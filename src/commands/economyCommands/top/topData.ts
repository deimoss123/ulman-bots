import { ApplicationCommandOptionType, ChatInputApplicationCommandData } from 'discord.js';

const topData: ChatInputApplicationCommandData = {
  name: 'top',
  description: 'Apskatīt severa lietotāja topu',
  options: [
    {
      name: 'kategorija',
      description: 'Kādu topu apskatīt',
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Latu daudzums makā',
          value: 'maks',
        },
        {
          name: 'Inventāra vērtība',
          value: 'inv',
        },
        {
          name: 'Kopējā vērtība',
          value: 'total',
        },
        {
          name: 'Līmenis',
          value: 'level',
        },
      ],
    },
  ],
};

export default topData;
