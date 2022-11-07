import getAllUsers from '../../../economy/getAllUsers';
import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import topData from './topData';
import errorEmbed from '../../../embeds/errorEmbed';
import topEmbed from './topEmbed';
import findUser from '../../../economy/findUser';
import { sortDataProfile, sortDataStats } from './sortData';
import getStatsMany from '../../../economy/stats/getStatsMany';
import intReply from '../../../utils/intReply';

export const TOP_LIMIT = 10;

const top: Command = {
  description: 'Apskatīt severa lietotāja topu',
  color: commandColors.top,
  data: topData,
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const category = i.options.getString('kategorija')!;

    //@ts-ignore
    const categoryTitle = this.data.options[0].choices.find(c => c.value === category).name as string;

    const isStatsCategory = category in sortDataStats ? true : category in sortDataProfile ? false : null;
    if (isStatsCategory === null) return intReply(i, errorEmbed);

    const defer = i.deferReply().catch(_ => _);

    const user = await findUser(userId, i.guildId!);

    if (!user) {
      await defer;
      return i.editReply(errorEmbed).catch(_ => _);
    }

    if (isStatsCategory) {
      const sortDataObj = sortDataStats[category];
      if (!sortDataObj) {
        await defer;
        return i.editReply(errorEmbed).catch(_ => _);
      }

      const { projection, sortFunc } = sortDataObj;
      const allUsers = await getStatsMany(i.client.user.id, guildId, projection);
      if (!allUsers) {
        await defer;
        return i.editReply(errorEmbed).catch(_ => _);
      }

      const sortedUsers = allUsers.sort(sortFunc);

      const usersToFetch = sortedUsers.slice(0, TOP_LIMIT).map(user => user.userId);
      if (!usersToFetch.includes(userId)) usersToFetch.push(userId);

      await Promise.all([i.guild!.members.fetch({ user: usersToFetch }), defer]);

      return i.editReply(topEmbed(i, categoryTitle, sortedUsers, sortDataObj)).catch(_ => _);
    }

    // koda atkārtošana jaaaaaaaaa, es padevos saprast tipuskriptu lai šo īsāk uzrakstīt
    const sortDataObj = sortDataProfile[category];
    if (!sortDataObj) {
      await defer;
      return i.editReply(errorEmbed).catch(_ => _);
    }

    const { projection, sortFunc } = sortDataObj;

    const allUsers = await getAllUsers(i.client.user!.id, guildId, projection);
    if (!allUsers) {
      await defer;
      return i.editReply(errorEmbed).catch(_ => _);
    }

    const sortedUsers = allUsers.sort(sortFunc);

    const usersToFetch = sortedUsers.slice(0, TOP_LIMIT).map(user => user.userId);
    if (!usersToFetch.includes(userId)) usersToFetch.push(userId);

    await Promise.all([i.guild!.members.fetch({ user: usersToFetch }), defer]);

    return i.editReply(topEmbed(i, categoryTitle, sortedUsers, sortDataObj)).catch(_ => _);
  },
};

export default top;
