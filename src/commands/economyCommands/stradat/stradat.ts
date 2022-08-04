import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import StradatInteractions, {
  StradatResult,
  StradatVeids,
} from '../../../interfaces/StradatInteraction';
import chance from '../../../items/helpers/chance';
import setnieks from './darbi/setnieks';
import veikala_darbinieks from './darbi/veikala_darbinieks';
import { JobPositions } from '../vakances/vakances';
import latiString from '../../../embeds/helpers/latiString';
import itemString from '../../../embeds/helpers/itemString';
import itemList from '../../../items/itemList';
import addXp from '../../../economy/addXp';
import xpAddedText from '../../../embeds/helpers/xpAddedText';
import addLati from '../../../economy/addLati';
import addItems from '../../../economy/addItems';

const darbiRun: Record<string, StradatInteractions> = { setnieks, veikala_darbinieks };

const STRADAT_XP_MIN = 2;
const STRADAT_XP_MAX = 4;

const stradat: Command = {
  title: 'Strādāt',
  description: 'Strādāt darbā un pelnīt naudu',
  color: commandColors.stradat,
  data: {
    name: 'stradat',
    description: 'Strādāt darbā un pelnīt naudu',
  },
  async run(i: ChatInputCommandInteraction) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const { jobPosition } = user;

    if (!jobPosition) {
      return i.reply(
        ephemeralReply(
          'Lai strādātu tev ir nepieciešama profesija, to var izvēlēties ar komandu /vakances'
        )
      );
    }

    const darbsRun = chance(darbiRun[jobPosition]).obj as StradatVeids;

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...darbsRun.options.map((o) =>
        new ButtonBuilder().setCustomId(o.customId).setStyle(ButtonStyle.Primary).setLabel(o.label)
      )
    );

    const embed = EmbedBuilder.from(
      embedTemplate({
        i,
        color: this.color,
        title: `Strādāt - ${JobPositions[jobPosition].name}`,
        description: darbsRun.text,
      }).embeds![0]
    );

    const interactionReply = await i.reply({
      content: '\u200b',
      embeds: [embed],
      components: [btnRow],
      fetchReply: true,
    });

    const customIds = darbsRun.options.map((o) => o.customId);

    await buttonHandler(
      i,
      'stradat',
      interactionReply,
      async (componentInteraction) => {
        const { customId } = componentInteraction;
        if (customIds.includes(customId)) {
          const choice = darbsRun.options.find((o) => o.customId === customId)!;
          const choiceResult = chance(choice.result).obj as StradatResult;

          let rewardText = 'Tu neko nenopelnīji';
          const { reward } = choiceResult;
          if (reward) {
            rewardText = 'Tu nopelnīji ';
            if (reward.lati) {
              const latiToAdd = Math.round(
                Math.random() * (reward.lati[1] - reward.lati[0]) + reward.lati[0]
              );
              await addLati(i.user.id, latiToAdd);
              rewardText += `**${latiString(latiToAdd, true)}** `;
            }
            if (reward.items) {
              await addItems(i.user.id, reward.items);
              rewardText += Object.entries(reward.items)
                .map(([key, amount]) => itemString(itemList[key], amount, true))
                .join(' ');
            }
          }

          const xpToAdd =
            Math.round(Math.random() * (STRADAT_XP_MAX - STRADAT_XP_MIN)) + STRADAT_XP_MIN;

          const leveledUser = await addXp(i.user.id, xpToAdd);
          if (!leveledUser) return;

          return {
            edit: {
              embeds: [
                embed.setDescription(
                  `${embed.data.description}\n` +
                    `> Izvēle: \`${choice.label}\`\n` +
                    `${choiceResult.text}\n\n` +
                    rewardText
                ),
                new EmbedBuilder().setDescription(
                  xpAddedText(leveledUser, xpToAdd, 'Par strādāšanu tu saņēmi')
                ),
              ],
              components: [],
            },
          };
        }
      },
      60000
    );
  },
};

export default stradat;
