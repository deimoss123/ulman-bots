import { ApplicationCommandOptionType, EmbedField } from 'discord.js';
import findUser from '../../../economy/findUser';
import getStatsMany from '../../../economy/stats/getStatsMany';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import StatsProfile, { UserStats } from '../../../interfaces/StatsProfile';
import statsList, { StatsTypes } from './statsList';

function displayPlace(index: number): string {
  return `\`${index + 1}#\``;
}

const statistika: Command = {
  description: 'statistika', //TODO: apraksts priekš /palidziba
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
      return i.reply(ephemeralReply('Tu nevari apskatīt UlmaņBota statistiku (viņš neizmanto komandas)'));
    }

    const defer = i.deferReply();

    const user = await findUser(target.id, guildId);
    if (!user) {
      await defer;
      return i.editReply(errorEmbed);
    }

    const category = i.options.getString('kategorija') as StatsTypes;

    const { entries } = statsList[category];

    const projection = Object.fromEntries(Object.keys(entries).map(key => [key, 1]));
    const allUserStats = await getStatsMany(i.client.user.id, guildId, projection);
    if (!allUserStats) {
      await defer;
      return i.editReply(errorEmbed);
    }

    const userStats = allUserStats.find(u => u.userId === target.id);
    if (!userStats) {
      await defer;
      return i.editReply(errorEmbed);
    }

    const fields: EmbedField[] = [];

    Object.entries(entries).forEach(([key, { name, displayValue }]) => {
      const sorted = allUserStats.sort(
        // mīlu tipuskriptu
        (a, b) => (b[key as keyof StatsProfile] as number) - (a[key as keyof StatsProfile] as number)
      );

      const index = sorted.findIndex(s => s.userId === target.id);

      // ja šis notiek tad ir dirsā
      if (index === -1) return i.reply(errorEmbed);

      fields.push({
        name: `${displayPlace(index)} ${name}`,
        value: displayValue(userStats[key as keyof UserStats]),
        inline: true,
      });
    });

    await defer;
    i.editReply(
      embedTemplate({
        i,
        color: this.color,
        title:
          `${target.id === i.user.id ? 'Tava' : `${target.tag}`} statistika | ` +
          // @ts-ignore
          this.data.options[0].choices.find(c => c.value === category).name,
        fields,
      })
    );
  },
};

export default statistika;
