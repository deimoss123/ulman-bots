import { ApplicationCommandOptionType, EmbedField } from 'discord.js';
import findUser from '../../../economy/findUser';
import getAllUsers from '../../../economy/getAllUsers';
import getStatsMany from '../../../economy/stats/getStatsMany';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import StatsProfile, { UserStats } from '../../../interfaces/StatsProfile';
import intReply from '../../../utils/intReply';
import { sortDataProfile } from '../top/sortData';
import statsList, { StatsTypes } from './statsList';

export function displayPlace(index: number): string {
  return `\`${index + 1}#\``;
}

const statistika: Command = {
  description: 'Apskatīt savu, vai kāda cita servera statistiku',
  color: commandColors.statistika,
  data: {
    name: 'statistika',
    description: 'Apskatīt savu, vai kāda cita lietotāja statistiku',
    options: [
      {
        name: 'kategorija',
        description: 'Statistikas kategorija',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: 'Maks/Inventārs',
            value: 'maks-inv',
          },
          {
            name: 'Veikals/Tirgus',
            value: 'veikals',
          },
          {
            name: 'Iedots/Maksāts',
            value: 'paygive',
          },
          {
            name: 'Zagšana',
            value: 'stolen',
          },
          {
            name: 'Feniks',
            value: 'feniks',
          },
          {
            name: 'Rulete',
            value: 'rulete',
          },
        ],
      },
      {
        name: 'lietotājs',
        description: 'Lietotājs, kuram apskatīt statistiku',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const guildId = i.guildId!;
    const target = i.options.getUser('lietotājs') ?? i.user;

    if (target.id === i.client.user.id) {
      return intReply(i, ephemeralReply('Tu nevari apskatīt UlmaņBota statistiku (viņš neizmanto komandas)'));
    }

    const defer = i.deferReply().catch(_ => _);

    const user = await findUser(target.id, guildId);
    if (!user) {
      await defer;
      return i.editReply(errorEmbed).catch(_ => _);
    }

    const chosenCategory = i.options.getString('kategorija');

    const fields: EmbedField[] = [];

    if (chosenCategory === 'maks-inv') {
      const projection = { lati: 1, items: 1, specialItems: 1, level: 1, xp: 1 };
      const allUsers = await getAllUsers(i.client.user.id, guildId, projection);
      if (!allUsers) {
        await defer;
        return i.editReply(errorEmbed).catch(_ => _);
      }

      const names = { maks: 'Maks', inv: 'Inventāra vērtība', total: 'Kopējā vērtība', level: 'Līmenis' };
      Object.entries(names).forEach(([key, value]) => {
        const sorted = allUsers.sort(sortDataProfile[key].sortFunc);
        const index = sorted.findIndex(u => u.userId === target.id);
        fields.push({
          name: `${displayPlace(index)} ${value}`,
          value: sortDataProfile[key].displayValue(user),
          inline: true,
        });
      });
    } else {
      const category = chosenCategory as StatsTypes;

      const { entries } = statsList[category];

      const projection = Object.fromEntries(Object.keys(entries).map(key => [key, 1]));
      const allUserStats = await getStatsMany(i.client.user.id, guildId, projection);
      if (!allUserStats) {
        await defer;
        return i.editReply(errorEmbed).catch(_ => _);
      }

      const userStats = allUserStats.find(u => u.userId === target.id);
      if (!userStats) {
        await defer;
        return i.editReply(errorEmbed).catch(_ => _);
      }

      Object.entries(entries).forEach(([key, { name, displayValue }]) => {
        const sorted = allUserStats.sort(
          // mīlu tipuskriptu
          (a, b) => (b[key as keyof StatsProfile] as number) - (a[key as keyof StatsProfile] as number)
        );

        const index = sorted.findIndex(s => s.userId === target.id);

        fields.push({
          name: `${displayPlace(index)} ${name}`,
          value: displayValue(userStats[key as keyof UserStats]),
          inline: true,
        });
      });
    }

    await defer;
    i.editReply(
      embedTemplate({
        i,
        color: this.color,
        title:
          `${target.id === i.user.id ? 'Tava' : `${target.tag}`} statistika | ` +
          // @ts-ignore
          this.data.options[0].choices.find(c => c.value === chosenCategory).name,
        fields,
      })
    );
  },
};

export default statistika;
