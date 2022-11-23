import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import smallEmbed from '../../embeds/smallEmbed';
import { UsableItemFunc } from '../../interfaces/Item';
import { ItemAttributes, ItemInProfile } from '../../interfaces/UserProfile';
import intReply from '../../utils/intReply';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';

export async function getRandFreeSpin() {
  const spins: ItemKey[] = ['brivgriez10', 'brivgriez25', 'brivgriez50'];
  return spins[Math.floor(Math.random() * spins.length)];
}

export const PETNIEKS_COOLDOWN = 43_200_000;

function embed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  text: string,
  attributes: ItemAttributes,
  color: number
) {
  return embedTemplate({
    i,
    title: `Izmantot: ${itemString('petnieks', null, true, attributes)}`,
    description: text,
    color,
  }).embeds;
}

function components(hatInInv: ItemInProfile | undefined, { hat }: ItemAttributes, disabled = false) {
  if (!hatInInv && !hat) return [];
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(hat ? `petnieks_remove_hat` : 'petnieks_add_hat')
        .setEmoji(itemList.salaveca_cepure.emoji!)
        .setLabel(hat ? 'Novilkt cepuri' : 'Uzvilkt cepuri')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled)
    ),
  ];
}

const petnieks: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    custom: async (i, color) => {
      const user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const hatInInv = user.items.find(({ name }) => name === 'salaveca_cepure');

      let text = '';
      const lastUsed = specialItem!.attributes.lastUsed!;

      if (Date.now() - lastUsed < PETNIEKS_COOLDOWN) {
        text =
          `Pētnieks tev nevar uzdāvināt brīvgriezienu, jo viņš to vēl nav atradis\n` +
          `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - Date.now() + lastUsed)}\``;
      } else if (!countFreeInvSlots(user)) {
        text = 'Lai saņemtu brīvgriezienu tev ir nepieciešama vismaz **1** brīva vieta inventārā';
      } else {
        const itemKey = specialItem!.attributes.foundItemKey!;

        await editItemAttribute(userId, guildId, specialItem!._id!, {
          ...specialItem!.attributes,
          lastUsed: Date.now(),
          foundItemKey: await getRandFreeSpin(),
        });

        const userAfter = await addItems(userId, guildId, { [itemKey]: 1 });
        if (!userAfter) return intReply(i, errorEmbed);

        text =
          `Pētnieks tev uzdāvināja ${itemString(itemList[itemKey], 1, true)}\n` +
          `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - 1)}\``;
      }

      const row = components(hatInInv, specialItem!.attributes);
      const msg = await intReply(i, {
        content: '\u200b',
        embeds: embed(i, text, specialItem!.attributes, color),
        components: row,
        fetchReply: true,
      });
      if (!row.length || !msg) return;

      buttonHandler(i, 'izmantot', msg, async int => {
        if (int.componentType !== ComponentType.Button) return;

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const petnieksInInv = user.specialItems.find(({ _id }) => _id === specialItem!._id);
        if (!petnieksInInv) {
          return {
            end: true,
            after: () => intReply(int, ephemeralReply('Kļūda, šis pētnieks vairs nav tavā inventārā')),
          };
        }

        if (int.customId === 'petnieks_add_hat') {
          if (!user.items.find(({ name }) => name === 'salaveca_cepure')) {
            return {
              end: true,
              after: () => intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString('salaveca_cepure')}**`)),
            };
          }

          await addItems(userId, guildId, { salaveca_cepure: -1 });
          const userAfter = await editItemAttribute(userId, guildId, petnieksInInv._id!, {
            ...petnieksInInv.attributes,
            hat: 'salaveca_cepure',
          });

          if (!userAfter) return { error: true };
          const newAttributes = userAfter.newItem.attributes;

          return {
            end: true,
            edit: {
              embeds: embed(i, text, newAttributes, color),
              components: [],
            },
            after: () =>
              intReply(int, smallEmbed(`Tu pētniekam uzvilki **${itemString('salaveca_cepure', null, true)}**`, color)),
          };
        }

        if (int.customId === 'petnieks_remove_hat') {
          if (petnieksInInv.attributes.hat !== 'salaveca_cepure') {
            return {
              end: true,
              after: () => intReply(int, ephemeralReply('Kļūda, šim pētniekam nav uzvilkta cepure')),
            };
          }

          if (!countFreeInvSlots(user)) {
            return {
              end: true,
              after: () =>
                intReply(int, ephemeralReply('Tu nevari pētniekam novilkt cepuri, jo tev nav brīvu vietu inventārā')),
            };
          }

          await addItems(userId, guildId, { salaveca_cepure: 1 });
          const userAfter = await editItemAttribute(userId, guildId, petnieksInInv._id!, {
            ...petnieksInInv.attributes,
            hat: '',
          });

          if (!userAfter) return { error: true };
          const newAttributes = userAfter.newItem.attributes;

          return {
            end: true,
            edit: {
              embeds: embed(i, text, newAttributes, color),
              components: [],
            },
            after: () =>
              intReply(
                int,
                smallEmbed(
                  `Tu pētniekam novilki **${itemString('salaveca_cepure', null, true)}**, ` +
                    `un tā tika pievienota tavam inventāram`,
                  color
                )
              ),
          };
        }
      });
    },
  };
};

export default petnieks;
