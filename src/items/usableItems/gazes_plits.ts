import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
  time,
} from 'discord.js';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import { UsableItem, UsableItemFunc } from '../../interfaces/Item';
import UserProfile, { ItemInProfile } from '../../interfaces/UserProfile';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import embedTemplate from '../../embeds/embedTemplate';
import itemString from '../../embeds/helpers/itemString';
import commandColors from '../../embeds/commandColors';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import buttonHandler from '../../embeds/buttonHandler';

interface CookableItem {
  input: ItemKey;
  output: ItemKey;
  time: number; // millis
}

export const cookableItems: CookableItem[] = [
  {
    input: 'lidaka',
    output: 'cepta_lidaka',
    time: 7_200_000, // 2h
  },
  {
    input: 'asaris',
    output: 'cepts_asaris',
    time: 10_800_000, // 3h
  },
  {
    input: 'lasis',
    output: 'cepts_lasis',
    time: 14_400_000, // 4h
  },
];

function getCookableItemsInInv({ items }: UserProfile): ItemInProfile[] {
  const inputItems = cookableItems.map(({ input }) => input);
  const cookableItemsInInv = items.filter(({ name }) => inputItems.includes(name));
  return cookableItemsInInv;
}

function embed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  cookingStatus: CookingStatus,
  cookableItemsInInv: ItemInProfile[],
  currTime: number
) {
  // prettier-ignore
  const text = !cookingStatus
    ? 'Šī gāzes plīts ir tukša...\n\n' + 
      '_Ar komandu `/info` vari uzzināt kādas mantas ir iespējams uzcept_'
    : cookingStatus.status === 'cooking'
      ? `🔥 Cepjas: **${itemString(cookingStatus.item.input)}**\n` +
        `Būs izcepies: **${time(new Date(cookingStatus.timeWhenDone), 't')}** ${time(new Date(cookingStatus.timeWhenDone), 'd')}\n` +
        `Pēc: \`${millisToReadableTime(cookingStatus.timeWhenDone - currTime)}\``
      : ''

  return embedTemplate({
    i,
    title: `Izmantot: ${itemString('gazes_plits', null, true)}`,
    description: text,
    color: commandColors.izmantot,
  }).embeds;
}

function components(cookingStatus: CookingStatus, cookableItemsInInv: ItemInProfile[], selectedItem: ItemKey = '') {
  if (!cookingStatus) {
    if (!cookableItemsInInv.length) {
      return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('_')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Tev nav cepjamu mantu')
            .setDisabled(true)
        ),
      ];
    }

    const selectOptions: SelectMenuComponentOptionData[] = cookableItemsInInv.map(({ name, amount }) => {
      const itemObj = itemList[name];
      return {
        value: name,
        label:
          `${capitalizeFirst(itemObj.nameNomVsk)} ` +
          `(${millisToReadableTime(cookableItems.find(({ input }) => input === name)!.time)})`,
        emoji: itemObj.emoji || '❓',
        default: name === selectedItem,
        description: `Tev ir ${amount}`,
      };
    });

    selectOptions.sort((a, b) => itemList[b.value].value - itemList[a.value].value);

    return [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('gazes_plits_select_menu')
          .setOptions(...selectOptions)
          .setPlaceholder('Izvēlies ko cept')
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('gazes_plits_select_btn')
          .setEmoji('🔥')
          .setLabel('Sākt cept')
          .setDisabled(!selectedItem)
          .setStyle(!selectedItem ? ButtonStyle.Secondary : ButtonStyle.Primary)
      ),
    ];
  }

  if (cookingStatus.status === 'cooking') {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('gazes_plits_cancel').setLabel('Atcelt cepšanu').setStyle(ButtonStyle.Danger)
      ),
    ];
  }

  const itemObj = itemList[cookingStatus.item.output];

  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('gazes_plits_collect')
        .setLabel(`Saņemt ${itemObj.nameNomVsk}`)
        .setEmoji(itemObj.emoji || '❓')
        .setStyle(ButtonStyle.Success)
    ),
  ];
}

// prettier-ignore
type CookingStatus = {
  status: 'done',
  item: CookableItem,
} | {
  status: 'cooking',
  item: CookableItem,
  timeWhenDone: number,
} | null;

function getCookingStatus(cookingItem: ItemKey, cookingStartedTime: number, currTime: number): CookingStatus {
  if (!cookingItem) return null;

  const cookableItem = cookableItems.find(({ input }) => input === cookingItem)!;
  const timeWhenDone = cookingStartedTime + cookableItem.time;

  return timeWhenDone < currTime
    ? { status: 'done', item: cookableItem }
    : { status: 'cooking', item: cookableItem, timeWhenDone };
}

const gazes_plits: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    custom: async i => {
      const user = await findUser(userId, guildId);
      if (!user || !specialItem) return intReply(i, errorEmbed);

      const currTime = Date.now();

      const cookingItem = specialItem.attributes.cookingItem!;
      const cookingStartedTime = specialItem.attributes.cookingStartedTime!;

      let cookingStatus = getCookingStatus(cookingItem, cookingStartedTime, currTime);

      let cookableItemsInInv = getCookableItemsInInv(user);
      let selectedItem = '';

      const msg = await intReply(i, {
        embeds: embed(i, cookingStatus, cookableItemsInInv, currTime),
        components: components(cookingStatus, cookableItemsInInv, selectedItem),
        fetchReply: true,
      });

      if (!msg || (!cookingStatus && !cookableItemsInInv.length)) return;

      buttonHandler(i, 'izmantot', msg, async int => {
        //
      });
    },
  };
};

export default gazes_plits;
