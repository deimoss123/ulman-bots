import { ChatInputCommandInteraction } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import StatsProfile from '../../../interfaces/StatsProfile';
import UserProfile from '../../../interfaces/UserProfile';
import { SortDataProfileEntry } from './sortData';
import { TOP_LIMIT } from './top';

export default function topEmbed<T extends UserProfile | StatsProfile>(
  i: ChatInputCommandInteraction,
  title: string,
  sortedUsers: T[],
  { displayValue, totalReduceFunc, partOfTotal, topDescription }: SortDataProfileEntry<T>
) {
  const total = totalReduceFunc && sortedUsers.reduce(totalReduceFunc, 0);

  const fields = sortedUsers.slice(0, TOP_LIMIT).map((user, index) => {
    return {
      name:
        (user.userId === i.user.id ? 'Tu ➔ ' : '') +
        `\`#${index + 1}\` ${i.guild!.members.cache.get(user.userId)?.user.tag || 'Nezināms lietotājs'} ` +
        (total ? `\`${(partOfTotal!(total, user) * 100).toFixed(2)}%\`` : ''),
      value: displayValue(user),
      inline: false,
    };
  });

  const indexOf = sortedUsers.findIndex(u => u.userId === i.user.id);

  if (indexOf > TOP_LIMIT - 1) {
    fields[TOP_LIMIT - 1].value += `\n__${'\u2800'.repeat(20)}__`;
    fields.push({
      name: `Tu ➔ \`#${indexOf + 1}\` ${i.user.tag}`,
      value: displayValue(sortedUsers.find(user => user.userId === i.user.id)!),
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
