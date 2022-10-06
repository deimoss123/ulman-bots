import getAllUsers from '../../../economy/getAllUsers';
import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import topData from './topData';
import errorEmbed from '../../../embeds/errorEmbed';
import topEmbed from './topEmbed';
import findUser from '../../../economy/findUser';
import sortData from './sortData';

export const TOP_LIMIT = 10;

const top: Command = {
  title: 'Top',
  description: 'Apskatīt severa lietotāja topu',
  color: commandColors.top,
  data: topData,
  async run(i) {
    const userId = i.user.id;

    const category = i.options.getString('kategorija')!;

    const sortDataObj = sortData[category];
    if (!sortDataObj) return i.reply(errorEmbed);

    const { projection, sortFunc } = sortDataObj;

    const defer = i.deferReply();

    const user = await findUser(userId, i.guildId!);
    const allUsers = await getAllUsers(i.client.user!.id, i.guildId!, projection);

    if (!user || !allUsers) {
      await defer;
      return i.editReply(errorEmbed);
    }

    const sortedUsers = allUsers.sort(sortFunc);
    console.log(sortedUsers);

    const usersToFetch = sortedUsers.slice(0, TOP_LIMIT).map(user => user.userId);
    if (!usersToFetch.includes(userId)) usersToFetch.push(userId);

    await Promise.all([i.guild!.members.fetch({ user: usersToFetch }), defer]);

    i.editReply(topEmbed(sortedUsers, i, sortDataObj));
  },
};

export default top;
