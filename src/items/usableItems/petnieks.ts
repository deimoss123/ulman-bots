import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import editMultipleItemAttributes from '../../economy/editMultipleItemAttributes';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import smallEmbed from '../../embeds/smallEmbed';
import { UsableItemFunc, UseManyType } from '../../interfaces/Item';
import { ItemAttributes, ItemInProfile } from '../../interfaces/UserProfile';
import intReply from '../../utils/intReply';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';

export function getRandFreeSpin() {
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

export const petnieksUseMany: UseManyType = {
  filter: ({ lastUsed }) => lastUsed! + PETNIEKS_COOLDOWN < Date.now(),
  async runFunc(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const usableItems = user.specialItems.filter(
      ({ name, attributes }) => name === 'petnieks' && this.filter(attributes)
    );

    if (!usableItems.length) {
      return intReply(i, ephemeralReply(`Tev nav neviens izmantojams **${itemString('petnieks')}**`));
    }

    const itemsToAdd: Record<ItemKey, number> = {};
    for (const {
      attributes: { foundItemKey },
    } of usableItems) {
      itemsToAdd[foundItemKey!] = itemsToAdd[foundItemKey!] ? itemsToAdd[foundItemKey!] + 1 : 1;
    }

    const freeSlots = countFreeInvSlots(user);
    if (freeSlots < usableItems.length) {
      return intReply(
        i,
        ephemeralReply(
          `Lai saņemtu brīvgriezienus tev vajag vismaz **${usableItems.length}** brīvas vietas inventārā\n` +
            `Tev ir **${freeSlots}** brīvas vietas`
        )
      );
    }

    const res = await editMultipleItemAttributes(
      userId,
      guildId,
      usableItems.map(({ _id, attributes }) => ({
        itemId: _id!,
        newAttributes: { ...attributes, foundItemKey: getRandFreeSpin(), lastUsed: Date.now() },
      }))
    );
    const res2 = await addItems(userId, guildId, itemsToAdd);

    if (!res || !res2) return intReply(i, errorEmbed);

    intReply(
      i,
      embedTemplate({
        i,
        color: commandColors.izmantot,
        title: `Izmantot ${itemString('petnieks', usableItems.length, true)}`,
        fields: [
          {
            name: 'Atrastie brīvgriezieni:',
            value: Object.entries(itemsToAdd)
              .sort((a, b) => itemList[b[0]].value - itemList[a[0]].value)
              .map(([name, amount]) => `> ${itemString(name, amount)}`)
              .join('\n'),
            inline: false,
          },
        ],
      })
    );
  },
};

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
          foundItemKey: getRandFreeSpin(),
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
