import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from 'discord.js';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import StradatInteractions, { StradatResult, StradatVeids } from '../../../interfaces/StradatInteraction';
import chance from '../../../items/helpers/chance';
import setnieks from './darbi/setnieks';
import veikala_darbinieks from './darbi/veikala_darbinieks';
import { JobPositions } from '../vakances/vakances';
import latiString from '../../../embeds/helpers/latiString';
import itemString from '../../../embeds/helpers/itemString';
import itemList from '../../../items/itemList';
import addXp from '../../../economy/addXp';
import xpAddedEmbed from '../../../embeds/helpers/xpAddedEmbed';
import addLati from '../../../economy/addLati';
import addItems from '../../../economy/addItems';
import addTimeCooldown from '../../../economy/addTimeCooldown';
import addDailyCooldown from '../../../economy/addDailyCooldown';
import UserProfile from '../../../interfaces/UserProfile';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import midNightStr from '../../../embeds/helpers/midnightStr';
import millisToReadableTime from '../../../embeds/helpers/millisToReadableTime';
import intReply from '../../../utils/intReply';

const darbiRun: Record<string, StradatInteractions> = { setnieks, veikala_darbinieks };

const STRADAT_XP_MIN = 2;
const STRADAT_XP_MAX = 4;

const MAX_DAILY = 6;
const MAX_EXTRA_DAILY = 3;

const STRADAT_COOLDOWN = 1_500_000; // 25 min

function embedTitle({ dailyCooldowns }: UserProfile, jobPosition: string) {
  return (
    `Strādāt - ${JobPositions[jobPosition].name} | ` +
    `${dailyCooldowns.stradat.timesUsed}/${MAX_DAILY} | ` +
    `${dailyCooldowns.stradat.extraTimesUsed}/${MAX_EXTRA_DAILY}`
  );
}

const stradat: Command = {
  description:
    'Strādāt sevis izvēlētajā darbā un pelnīt naudu\n\n' +
    'Darba pozīciju var izvēlēties ar komandu `/vakances`\n' +
    'Lietotājiem no sākuma būs pieejama tikai 1 darba pozīcija, taču var atbloķēt citas sasniedzot noteiktus līmeņus\n' +
    'Pašreizējo darba pozīciju un līmeni var redzet ar komandu `/profils`\n\n' +
    `Katrs var strādāt **${MAX_DAILY}** reizes dienā (resetojas plkst. ${midNightStr()}), ` +
    `bet ir iespējams iegūt papildus ${MAX_EXTRA_DAILY} strādāšanas reizes dienā\n` +
    `Lai strādātu papildus reizes inventārā ir nepieciešama **${itemString(itemList.kafija)}** vai **${itemString(itemList.redbulls)}**, ` +
    `par katru papildus reizi izvēlētā manta tiks iztērēta\n\n` +
    `Strādāt var ik **${millisToReadableTime(STRADAT_COOLDOWN)}**\n` +
    `Katra strādāšanas reize dod **${STRADAT_XP_MIN}** - **${STRADAT_XP_MAX}** UlmaņPunktus`,
  color: commandColors.stradat,
  cooldown: STRADAT_COOLDOWN,
  data: {
    name: 'stradat',
    description: 'Strādāt darbā un pelnīt naudu',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const { jobPosition, dailyCooldowns, items } = user;
    let isExtraUse = false;

    if (!jobPosition) {
      return intReply(
        i,
        ephemeralReply('Lai strādātu tev ir nepieciešama profesija, to var izvēlēties ar komandu `/vakances`')
      );
    }

    if (dailyCooldowns.stradat.extraTimesUsed >= MAX_EXTRA_DAILY) {
      return intReply(i, ephemeralReply('Tu esi sasniedzis gan parasto, gan papildus **šodienas** strādāšanas limitu'));
    }

    if (!countFreeInvSlots(user)) {
      return intReply(i, ephemeralReply('Lai strādātu tev vajag vismaz vienu brīvu vietu inventārā'));
    }

    const darbsRun = chance(darbiRun[jobPosition]).obj as StradatVeids;

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...darbsRun.options.map(o =>
        new ButtonBuilder().setCustomId(o.customId).setStyle(ButtonStyle.Primary).setLabel(o.label)
      )
    );

    const embed = EmbedBuilder.from(
      embedTemplate({
        i,
        color: this.color,
        title: embedTitle(user, jobPosition),
        description: darbsRun.text,
      }).embeds![0]
    );

    let interactionReply: Message | null;

    if (dailyCooldowns.stradat.timesUsed >= MAX_DAILY) {
      if (!items.find(item => item.name === 'kafija'|| item.name === 'redbulls')) {
        return intReply(
          i,
          ephemeralReply(
            'Tu esi sasniedzis maksimālo strādāšanas daudzumu šodien\n' +
              `Lai strādātu vēlreiz tev ir nepieciešama: ${itemString(itemList.kafija)} vai ${itemString(itemList.redbulls)}`
          )
        );
      }

      const stradatVelreizRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('stradat_velreiz')
          .setStyle(ButtonStyle.Primary)
          .setLabel('Strādāt vēlreiz (izdzert kafiju)')
          .setEmoji(itemList.kafija.emoji!),
        new ButtonBuilder()
          .setCustomId('stradat_velreiz_bullis')
          .setStyle(ButtonStyle.Primary)
          .setLabel('Strādāt vēlreiz (izdzert bulli)')
          .setEmoji(itemList.kafija.emoji!)
      );

      const stradatVelreizEmbed = EmbedBuilder.from(
        embedTemplate({
          i,
          color: this.color,
          title: embedTitle(user, jobPosition),
          description: 'Tu esi sasniedzis maksimālo strādāšanas daudzumu šodien\n',
        }).embeds![0]
      );

      interactionReply = await intReply(i, {
        content: '\u200b',
        embeds: [stradatVelreizEmbed],
        components: [stradatVelreizRow],
        fetchReply: true,
      });
    } else {
      interactionReply = await intReply(i, {
        content: '\u200b',
        embeds: [embed],
        components: [btnRow],
        fetchReply: true,
      });
    }

    if (!interactionReply) return;

    const customIds = darbsRun.options.map(o => o.customId);

    buttonHandler(
      i,
      'stradat',
      interactionReply,
      async int => {
        const { customId } = int;
        if (customId === 'stradat_velreiz') {
          await addItems(userId, guildId, { kafija: -1 });
          isExtraUse = true;
          return {
            edit: { embeds: [embed], components: [btnRow] },
          };
        } else if (customId === 'stradat_velreiz_bullis') {
          await addItems(userId, guildId, { redbulls: -1 });
          isExtraUse = true;
          return {
            edit: { embeds: [embed], components: [btnRow] },
          };
        }

        if (customIds.includes(customId)) {
          const choice = darbsRun.options.find(o => o.customId === customId)!;
          const choiceResult = chance(choice.result).obj as StradatResult;

          let rewardText = 'Tu neko nenopelnīji';
          const { reward } = choiceResult;

          if (reward) {
            rewardText = 'Tu nopelnīji ';
            if (reward.lati) {
              const latiToAdd = Math.round(Math.random() * (reward.lati[1] - reward.lati[0]) + reward.lati[0]);
              await addLati(userId, guildId, latiToAdd);
              rewardText += `**${latiString(latiToAdd, true)}** `;
            }
            if (reward.items) {
              await addItems(userId, guildId, reward.items);
              rewardText += Object.entries(reward.items)
                .map(([key, amount]) => itemString(itemList[key], amount, true))
                .join(' ');
            }
          }

          const xpToAdd = Math.round(Math.random() * (STRADAT_XP_MAX - STRADAT_XP_MIN)) + STRADAT_XP_MIN;

          await addTimeCooldown(userId, guildId, this.data.name);
          await addDailyCooldown(userId, guildId, 'stradat', isExtraUse);

          const leveledUser = await addXp(userId, guildId, xpToAdd);
          if (!leveledUser) return { error: true };

          return {
            end: true,
            edit: {
              embeds: [
                embed
                  .setTitle(embedTitle(leveledUser.user, jobPosition))
                  .setDescription(
                    `${embed.data.description}\n` +
                      `> Izvēle: \`${choice.label}\`\n` +
                      `${choiceResult.text}\n\n` +
                      rewardText
                  ),
                xpAddedEmbed(leveledUser, xpToAdd, 'Par strādāšanu tu saņēmi'),
              ],
              components: [],
            },
          };
        }
      },
      60000,
      true
    );
  },
};

export default stradat;
