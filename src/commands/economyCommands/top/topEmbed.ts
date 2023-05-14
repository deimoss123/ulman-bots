import { ChatInputCommandInteraction } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import iconEmojis from '../../../embeds/iconEmojis';
import StatsProfile from '../../../interfaces/StatsProfile';
import UserProfile from '../../../interfaces/UserProfile';
import { displayPlace } from '../statistika/statistika';
import { SortDataProfileEntry } from './sortData';
import { TOP_USERS_PER_PAGE } from './top';

export default function topEmbed<T extends UserProfile | StatsProfile>(
  i: ChatInputCommandInteraction,
  title: string,
  currentPage: number,
  sortedUsers: T[],
  { displayValue, totalReduceFunc, partOfTotal, topDescription }: SortDataProfileEntry<T>
) {
  const total = totalReduceFunc && sortedUsers.reduce(totalReduceFunc, 0);

  const offset = TOP_USERS_PER_PAGE * currentPage;
  const slicedUsers = sortedUsers.slice(offset, offset + TOP_USERS_PER_PAGE);

  const fields = slicedUsers.map((user, index) => {
    return {
      name:
        (user.userId === i.user.id ? `${iconEmojis.blueArrowRight} ` : '') +
        `${displayPlace(index + offset)} ${
          i.guild!.members.cache.get(user.userId)?.user.tag || 'Nezināms lietotājs'
        } ` +
        (total ? `\`${(partOfTotal!(total, user) * 100).toFixed(2)}%\`` : ''),
      value: displayValue(user),
      inline: false,
    };
  });

  const indexOf = sortedUsers.findIndex(u => u.userId === i.user.id);

  if (!slicedUsers.find(u => u.userId === i.user.id)) {
    const foundUser = sortedUsers.find(user => user.userId === i.user.id)!;

    fields[fields.length - 1].value += `\n__${'\u2800'.repeat(20)}__`;
    fields.push({
      name:
        `${iconEmojis.blueArrowRight} ${displayPlace(indexOf)} ${i.user.tag} ` +
        (total ? `\`${(partOfTotal!(total, foundUser) * 100).toFixed(2)}%\`` : ''),
      value: displayValue(foundUser),
      inline: false,
    });
  }

  return embedTemplate({
    i,
    description: total ? topDescription!(total) : undefined,
    color: commandColors.top,
    title: `Servera tops | ${title}`,
    fields,
  });
}
