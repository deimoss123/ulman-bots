import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputApplicationCommandData,
} from 'discord.js';

export type RulColors = 'red' | 'black' | 'green';

export type RulPosition = 'black' | 'red' | 'low' | 'high' | 'odd' | 'even';

export const ruleteOrder: [number, RulColors][] = [
  [0, 'green'],
  [32, 'red'],
  [15, 'black'],
  [19, 'red'],
  [4, 'black'],
  [21, 'red'],
  [2, 'black'],
  [25, 'red'],
  [17, 'black'],
  [34, 'red'],
  [6, 'black'],
  [27, 'red'],
  [13, 'black'],
  [36, 'red'],
  [11, 'black'],
  [30, 'red'],
  [8, 'black'],
  [23, 'red'],
  [10, 'black'],
  [5, 'red'],
  [24, 'black'],
  [16, 'red'],
  [33, 'black'],
  [1, 'red'],
  [20, 'black'],
  [14, 'red'],
  [31, 'black'],
  [9, 'red'],
  [22, 'black'],
  [18, 'red'],
  [29, 'black'],
  [7, 'red'],
  [28, 'black'],
  [12, 'red'],
  [35, 'black'],
  [3, 'red'],
  [26, 'black'],
];

export const rulPositions: Record<
  RulPosition,
  { name: string; shortName: string; isMatching: (pos: number) => boolean }
> = {
  black: {
    name: 'Krāsa - melns',
    shortName: 'melns',
    // numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    isMatching: pos => ruleteOrder.find(([num]) => num === pos)![1] === 'black',
  },
  red: {
    name: 'Krāsa - sarkans',
    shortName: 'sarkans',
    // numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    isMatching: pos => ruleteOrder.find(([num]) => num === pos)![1] === 'red',
  },
  low: {
    name: 'Zems skaitlis (1 - 18)',
    shortName: 'zems sk.',
    // numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    isMatching: pos => pos >= 1 && pos <= 18,
  },
  high: {
    name: 'Augsts skaitlis (19 - 36)',
    shortName: 'augsts sk.',
    // numbers: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    isMatching: pos => pos >= 19 && pos <= 36,
  },
  odd: {
    name: 'Nepāra skaitlis',
    shortName: 'nepāra sk.',
    // numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
    isMatching: pos => pos % 2 !== 0,
  },
  even: {
    name: 'Pāra skaitlis',
    shortName: 'pāra sk.',
    // numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
    isMatching: pos => pos % 2 === 0 && pos !== 0,
  },
};

const posData: ApplicationCommandSubCommandData['options'] = [
  {
    name: 'pozīcija',
    description: 'Ar kādu pozīciju griezt ruleti (reizinātājs x2)',
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: Object.entries(rulPositions).map(([key, v]) => ({ name: v.name, value: key })),
  },
];

const numData: ApplicationCommandSubCommandData['options'] = [
  {
    name: 'skaitlis',
    description: 'Uz kuru ruletes skaitli gribi likt likmi (0 - 36) (reizinātājs x35)',
    type: ApplicationCommandOptionType.Integer,
    required: true,
    min_value: 0,
    max_value: 36,
  },
];

const ruleteData: ChatInputApplicationCommandData = {
  name: 'rulete',
  description: 'Griezt ruleti',
  options: [
    {
      name: 'skaitlis',
      description: 'Griezt pēc noteikta skaitļa',
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: '-',
          description: 'Ar cik lielu likmi griezt ruleti',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            ...numData,
            {
              name: 'likme_lati',
              description: 'Ar cik lielu likmi griezt ruleti',
              required: true,
              type: ApplicationCommandOptionType.Integer,
              min_value: 20,
            },
          ],
        },
        {
          name: 'virve',
          description: 'Griezt ruleti ar nejauši izvēlētu likmi',
          type: ApplicationCommandOptionType.Subcommand,
          options: numData,
        },
        {
          name: 'viss',
          description: 'Griezt ruleti ar visu naudu makā',
          type: ApplicationCommandOptionType.Subcommand,
          options: numData,
        },
      ],
    },
    {
      name: 'pozīcija',
      description: 'Griezt pēc pozīcijas - krāsa, augsts/zems, pāra/nepāra',
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: '-',
          description: 'Ar cik lielu likmi griezt ruleti',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            ...posData,
            {
              name: 'likme_lati',
              description: 'Ar cik lielu likmi griezt ruleti',
              required: true,
              type: ApplicationCommandOptionType.Integer,
              min_value: 20,
            },
          ],
        },
        {
          name: 'virve',
          description: 'Griezt ruleti ar nejauši izvēlētu likmi',
          type: ApplicationCommandOptionType.Subcommand,
          options: posData,
        },
        {
          name: 'viss',
          description: 'Griezt ruleti ar visu naudu makā',
          type: ApplicationCommandOptionType.Subcommand,
          options: posData,
        },
      ],
    },
  ],
};

export default ruleteData;
