import { ButtonInteraction, CommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';

const spinEmoji = {
  id: '917087131128700988',
  name: 'fenka1',
};

function makeEmbed(i: CommandInteraction | ButtonInteraction, likme: number) {
  return [
    embedTemplate({
      i,
      title: 'Griežas...',
      color: 0x36393f,
      description:
        `>>\u2800\u2800${`<a:${spinEmoji.name}:${spinEmoji.id}>\u2800`.repeat(5)}\u2800<<\n\n` +
        `**Likme:** ${latiString(likme)}`,
    }).embeds![0],
  ];
}

const laimesti = {};

export default async function feniksRun(
  i: CommandInteraction | ButtonInteraction,
  likme: number,
  isFree = false
): Promise<any> {
  const msg = await i.reply({
    embeds: makeEmbed(i, likme),
    components: [],
    fetchReply: true,
  });
}
