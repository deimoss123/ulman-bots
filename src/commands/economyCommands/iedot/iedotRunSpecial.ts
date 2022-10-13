import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import addLati from '../../../economy/addLati';
import addSpecialItems from '../../../economy/addSpecialItems';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setStats from '../../../economy/setStats';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import Item from '../../../interfaces/Item';
import UserProfile, { SpecialItemInProfile } from '../../../interfaces/UserProfile';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../../../items/itemList';
import { cantPayTaxEmbed } from './iedot';

async function iedotSpecialQuery(
  i: CommandInteraction,
  targetUser: UserProfile,
  guildId: string,
  selectedItems: SpecialItemInProfile[]
) {
  const user = await removeItemsById(
    i.user.id,
    guildId,
    selectedItems.map(item => item._id!)
  );
  await addSpecialItems(targetUser.userId, guildId, selectedItems);
  return user;
}

function makeEmbedAfter(
  i: CommandInteraction,
  taxLati: number,
  targetUser: UserProfile,
  itemsToGive: SpecialItemInProfile[],
  hasJuridisks: boolean,
  itemObj: Item
) {
  return embedTemplate({
    i,
    color: commandColors.iedot,
    content: `<@${targetUser.userId}>`,
    description:
      `Nodoklis: ${hasJuridisks ? '**0** lati (juridiska persona)' : `${latiString(taxLati, false, true)}`}\n` +
      `<@${targetUser.userId}> tu iedevi:`,
    fields: [
      ...itemsToGive.map(item => ({
        name: itemString(itemObj, null, true, item.attributes.customName),
        value:
          `Vērtība: ${latiString(
            itemObj.customValue ? itemObj.customValue(item.attributes) : itemObj.value,
            false,
            true
          )}\n` + displayAttributes(item),
        inline: false,
      })),
    ],
  });
}

function makeEmbed(
  i: CommandInteraction,
  itemsInInv: SpecialItemInProfile[],
  itemObj: Item,
  targetUserId: string,
  user: UserProfile,
  hasJuridisks: boolean,
  taxLati?: number
) {
  return embedTemplate({
    i,
    color: commandColors.iedot,
    description:
      `Tavā inventārā ir **${itemString(itemObj, itemsInInv.length)}**\n` +
      `No saraksta izvēlies vienu vai vairākas mantas ko iedot <@${targetUserId}>\n\n` +
      `**Nodoklis:** ` +
      (hasJuridisks
        ? `**0 lati** (juridiska persona)`
        : `${taxLati ? latiString(taxLati) : '-'} (${Math.floor(user.giveTax * 100)}% no mantu kopējās vērtības)`),
  }).embeds!;
}

function makeComponents(
  itemsInInv: SpecialItemInProfile[],
  itemObj: Item,
  selectedItems: SpecialItemInProfile[],
  totalTax = 0,
  userLati = 0,
  hasGiven = false
) {
  const selectedIds = selectedItems.map(item => item._id!);

  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('iedot_special_select')
        .setPlaceholder('Izvēlies ko iedot')
        .setMinValues(1)
        .setMaxValues(itemsInInv.length)
        .setOptions(
          itemsInInv
            .slice(0, 25)
            .sort((a, b) =>
              itemObj.customValue ? itemObj.customValue(b.attributes) - itemObj.customValue(a.attributes) : 0
            )
            .map(item => ({
              label: itemStringCustom(itemObj, item.attributes?.customName),
              description:
                `${latiString(itemObj.customValue ? itemObj.customValue(item.attributes) : itemObj.value)} | ` +
                displayAttributes(item, true),
              value: item._id!,
              emoji: itemObj.emoji || '❓',
              default: !!selectedIds.length && selectedIds!.includes(item._id!),
            }))
        )
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('iedot_special_confirm')
        .setDisabled(!selectedIds.length || userLati < totalTax)
        .setLabel(userLati < totalTax ? 'Iedot (nepietiek naudas)' : 'Iedot')
        .setStyle(
          hasGiven // šizofrēnija
            ? ButtonStyle.Success
            : userLati < totalTax
            ? ButtonStyle.Danger
            : selectedIds.length
            ? ButtonStyle.Primary
            : ButtonStyle.Secondary
        )
    ),
  ];
}

function checkTargetInv(targetUser: UserProfile, amountToGive: number): boolean {
  if (amountToGive > countFreeInvSlots(targetUser)) return false;
  return true;
}

export function noInvSpaceEmbed(targetUser: UserProfile, itemToGive: Item, amountToGive: number) {
  return ephemeralReply(
    `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
      `<@${targetUser.userId}> inventārā ir **${countFreeInvSlots(targetUser)}** brīvas vietas`
  );
}

export default async function iedotRunSpecial(
  i: CommandInteraction,
  user: UserProfile,
  targetUser: UserProfile,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  hasJuridisks: boolean
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey];
  let selectedItems: SpecialItemInProfile[] = [];

  let totalTax: number;

  if (itemsInInv.length === 1) {
    const hasInvSpace = checkTargetInv(targetUser, 1);
    if (!hasInvSpace) {
      return i.reply(noInvSpaceEmbed(targetUser, itemObj, 1));
    }

    const checkRes = checkUserSpecialItems(targetUser, itemKey);
    if (!checkRes.valid) {
      return i.reply(ephemeralReply(`Neizdevās iedot, jo ${checkRes.reason}`));
    }

    if (hasJuridisks) totalTax = 0;
    else {
      const value = itemObj.customValue ? itemObj.customValue(itemsInInv[0].attributes) : itemObj.value;
      totalTax = Math.floor(value * user.giveTax);
    }

    if (user.lati < totalTax) {
      return i.reply(cantPayTaxEmbed(itemObj, 1, totalTax, user));
    }

    const promises = [
      iedotSpecialQuery(i, targetUser, guildId, itemsInInv),
      setStats(targetUser.userId, guildId, { itemsReceived: 1 }),
      setStats(userId, guildId, { itemsGiven: 1, taxPaid: totalTax }),
    ];

    if (!hasJuridisks) {
      promises.push(addLati(userId, guildId, -totalTax), addLati(i.client.user!.id, guildId, totalTax));
    }

    await Promise.all(promises);

    return i.reply(makeEmbedAfter(i, totalTax, targetUser, itemsInInv, hasJuridisks, itemObj));
  }

  const msg = await i.reply({
    embeds: makeEmbed(i, itemsInInv, itemObj, targetUser.userId, user, hasJuridisks),
    components: makeComponents(itemsInInv, itemObj, selectedItems),
    fetchReply: true,
  });

  await buttonHandler(
    i,
    'iedot',
    msg,
    async componentInteraction => {
      const { customId } = componentInteraction;
      if (customId === 'iedot_special_select') {
        if (componentInteraction.componentType !== ComponentType.SelectMenu) return;
        selectedItems = itemsInInv.filter(item => componentInteraction.values.includes(item._id!));

        const userAfterSelect = await findUser(userId, guildId);
        if (!userAfterSelect) return { error: true };

        if (hasJuridisks) totalTax = 0;
        else {
          totalTax =
            Math.floor(
              (itemObj.customValue
                ? selectedItems.reduce((prev, item) => prev + itemObj.customValue!(item.attributes), 0)
                : itemObj.value * selectedItems.length) * userAfterSelect.giveTax
            ) || 1;
        }

        return {
          edit: {
            embeds: makeEmbed(i, itemsInInv, itemObj, targetUser.userId, userAfterSelect, hasJuridisks, totalTax),
            components: makeComponents(itemsInInv, itemObj, selectedItems, totalTax, userAfterSelect.lati),
          },
        };
      } else if (customId === 'iedot_special_confirm') {
        if (componentInteraction.componentType !== ComponentType.Button) return;
        if (!selectedItems.length) return;

        const targetUserNew = await findUser(targetUser.userId, guildId);
        if (!targetUserNew) return { error: true };

        const hasInvSpace = checkTargetInv(targetUserNew, selectedItems.length);
        if (!hasInvSpace) {
          componentInteraction.reply(noInvSpaceEmbed(targetUserNew, itemObj, selectedItems.length));
          return { end: true };
        }

        const checkRes = checkUserSpecialItems(targetUserNew, itemKey, selectedItems.length);
        if (!checkRes.valid) {
          componentInteraction.reply(ephemeralReply(`Neizdevās iedot, jo ${checkRes.reason}`));
          return { end: true };
        }

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        if (user.lati < totalTax) {
          return {
            after: async () => {
              await componentInteraction.reply(cantPayTaxEmbed(itemObj, selectedItems.length, totalTax, user));
            },
          };
        }

        const userItemIds = user.specialItems.map(item => item._id!);
        for (const specItem of selectedItems) {
          if (!userItemIds.includes(specItem._id!)) {
            return {
              after: async () => {
                await componentInteraction.reply(
                  ephemeralReply('Tavs inventāra saturs ir mainījies, kāda no izvēlētām mantām nav tavā inventārā')
                );
              },
            };
          }
        }

        const promises = [
          iedotSpecialQuery(i, targetUser, guildId, selectedItems),
          setStats(targetUser.userId, guildId, { itemsReceived: selectedItems.length }),
          setStats(userId, guildId, { itemsGiven: selectedItems.length, taxPaid: totalTax }),
        ];

        if (!hasJuridisks) {
          promises.push(addLati(userId, guildId, -totalTax), addLati(i.client.user!.id, guildId, totalTax));
        }

        await Promise.all(promises);

        return {
          end: true,
          edit: {
            components: makeComponents(itemsInInv, itemObj, selectedItems, totalTax, user.lati, true),
          },
          after: async () => {
            await componentInteraction.reply(
              makeEmbedAfter(i, totalTax, targetUser, selectedItems, hasJuridisks, itemObj)
            );
          },
        };
      }
    },
    60000
  );
}
