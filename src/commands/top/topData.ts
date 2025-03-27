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
          name: 'Maks',
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
        {
          name: 'Feniks - iztērēts',
          value: 'fenkaSpent',
        },
        {
          name: 'Feniks - griezienu skaits',
          value: 'fenkaSpinCount',
        },
        {
          name: 'Rulete - iztērēts',
          value: 'rulSpent',
        },
        {
          name: 'Rulete - griezienu skaits',
          value: 'rulSpinCount',
        },
      ],
    },
  ],
};

export default topData;
