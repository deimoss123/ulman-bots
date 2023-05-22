import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  time,
} from 'discord.js';
import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import smallEmbed from '../../embeds/smallEmbed';
import { UsableItemFunc } from '../../interfaces/Item';
import UserProfile, { ItemAttributes, ItemInProfile, SpecialItemInProfile } from '../../interfaces/UserProfile';
import intReply from '../../utils/intReply';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';

export const kakisFedState: {
  time: number;
  name: string;
}[] = [
  {
    time: 216_000_000, // 60h
    name: 'Aptaukojies 😎',
  },
  {
    time: 172_800_000, // 48h
    name: 'Pieēdies 😋',
  },
  {
    time: 129_600_000, // 36h
    name: 'Labi paēdis 😃',
  },
  {
    time: 86_400_000, // 24h
    name: 'Apmierināts 🙂',
  },
  {
    time: 43_200_000, // 12h
    name: 'Izsalcis 🥺',
  },
  {
    time: 0,
    name: 'ĻOTI IZSALCIS 😡',
  },
];

// kaķa maksimālais pabarošanas laiks, 3d
export const KAKIS_MAX_FEED = 259_200_000;

export const kakisFoodData: Record<ItemKey, { feedTimeMs: number }> = {
  lidaka: {
    feedTimeMs: 57_600_000, // 16h
  },
  asaris: {
    feedTimeMs: 72_000_000, // 20h
  },
  lasis: {
    feedTimeMs: 86_400_000, // 24h
  },
  kaku_bariba: {
    feedTimeMs: 129_600_000, // 36h
  },
};

export function foodDataPercentage(key: ItemKey) {
  return `(${Math.floor((kakisFoodData[key].feedTimeMs / KAKIS_MAX_FEED) * 100)}%)`;
}

function catFedPercentage(fedUntil: number, currTime: number) {
  return `${Math.round(((fedUntil - currTime) / KAKIS_MAX_FEED) * 100)}%`;
}

function deadTime(createdAt: number, fedUntil: number) {
  return (
    `**${time(new Date(createdAt), 't')}** ${time(new Date(createdAt), 'd')} **―** ` +
    `**${time(new Date(fedUntil), 't')}** ${time(new Date(fedUntil), 'd')}`
  );
}

function embed(i: ChatInputCommandInteraction | ButtonInteraction, attributes: ItemAttributes, currTime: number) {
  const { createdAt, fedUntil } = attributes;
  const isDead = fedUntil! < currTime;

  return embedTemplate({
    i,
    color: commandColors.izmantot,
    title: `Izmantot: ${itemString(itemList.kakis, null, true, attributes)} ${isDead ? '(miris)' : ''}`,
    description: isDead
      ? `🪦 ${deadTime(createdAt!, fedUntil!)}`
      : `Vecums: **${millisToReadableTime(currTime - createdAt!)}**\n` +
        `Garastāvoklis: **${kakisFedState.find(s => fedUntil! - currTime > s.time)?.name}** ` +
        `(${catFedPercentage(fedUntil!, currTime)})`,
  }).embeds;
}

const changeNameBtn = () =>
  new ButtonBuilder()
    .setLabel('Mainīt kaķa vārdu')
    .setCustomId(`cat_change_name`)
    .setStyle(ButtonStyle.Primary)
    .setEmoji(itemList.kaka_parsaucejs.emoji ?? '❓');

function hatButton(items: ItemInProfile[], hat: string, hatModified: boolean) {
  const hatInInv = items.find(({ name }) => name === 'salaveca_cepure');
  if (!hat && !hatInInv) return null;

  return new ButtonBuilder()
    .setCustomId(hat ? 'cat_remove_hat' : 'cat_add_hat')
    .setLabel(`${hat ? 'Novilkt cepuri' : 'Uzvilkt cepuri'}${hatModified ? ' (izmanto vēlreiz)' : ''}`)
    .setEmoji(itemList.salaveca_cepure.emoji || '❓')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(hatModified);
}

function components(
  { items }: UserProfile,
  { fedUntil, hat }: ItemAttributes,
  currTime: number,
  hatModified: boolean,
  selectedFood: ItemKey = ''
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
  const isDead = fedUntil! < currTime;

  const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
  let buttonRow: ActionRowBuilder<ButtonBuilder> | null = null;

  const foodInInv = items
    .filter(({ name }) => Object.keys(kakisFoodData).includes(name))
    .sort(
      (a, b) => kakisFoodData[b.name].feedTimeMs / KAKIS_MAX_FEED - kakisFoodData[a.name].feedTimeMs / KAKIS_MAX_FEED
    );

  if (!foodInInv.length && !buttonRow && !isDead) {
    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Tev nav ar ko pabarot kaķi')
        .setCustomId('_')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
    );
  }

  if (catFedPercentage(fedUntil!, currTime) === '100%' && !buttonRow && !isDead) {
    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Kaķis ir maksimāli piebarots')
        .setCustomId('_')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
    );
  }

  if (!isDead && !buttonRow) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('feed_cat_select')
          .setPlaceholder('Izvēlies ēdienu')
          .addOptions(
            foodInInv.map(({ name, amount }) => {
              const { nameNomVsk, emoji } = itemList[name];
              return {
                label: `${capitalizeFirst(nameNomVsk)} ${foodDataPercentage(name)}`,
                description: `Tev ir ${amount}`,
                value: name,
                emoji: emoji || '❓',
                default: name === selectedFood,
              };
            })
          )
      )
    );

    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`Pabarot kaķi`)
        .setCustomId('feed_cat_btn')
        .setStyle(selectedFood ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(!selectedFood)
    );
  }

  const nameTagInInv = items.find(({ name }) => name === 'kaka_parsaucejs');
  if (nameTagInInv) {
    if (buttonRow) buttonRow.addComponents(changeNameBtn());
    else buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(changeNameBtn());
  }

  const hatBtn = hatButton(items, hat!, hatModified);
  if (hatBtn) {
    if (buttonRow) buttonRow.addComponents(hatBtn);
    else buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(hatBtn);
  }

  if (buttonRow) components.push(buttonRow);
  return components;
}

async function handleCatModal(
  i: ModalSubmitInteraction
): Promise<
  { user: UserProfile; error: true } | { user: UserProfile; newItem: SpecialItemInProfile; error: false } | void
> {
  const user = await findUser(i.user.id, i.guildId!);
  if (!user) {
    intReply(i, errorEmbed);
    return;
  }

  const nameTagInInv = user.items.find(({ name }) => name === 'kaka_parsaucejs');
  if (!nameTagInInv) {
    intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString('kaka_parsaucejs')}**`));
    return { user, error: true };
  }

  const catId = i.customId.substring('cat_modal_'.length);
  const newName = i.fields.getTextInputValue('cat_modal_input').trim();

  const catPrev = user.specialItems.find(item => item._id === catId);
  if (!catPrev) {
    intReply(i, errorEmbed);
    return { user, error: true };
  }

  if (newName === catPrev.attributes.customName) {
    intReply(i, ephemeralReply('Jaunajam kaķa vārdam ir jāatšķiras no vecā'));
    return { user, error: true };
  }

  const res = await editItemAttribute(i.user.id, i.guildId!, catId, {
    ...catPrev.attributes,
    customName: newName,
  });
  if (!res) {
    intReply(i, errorEmbed);
    return;
  }

  const userAfter = await addItems(i.user.id, i.guildId!, { kaka_parsaucejs: -1 });
  if (!userAfter) {
    intReply(i, errorEmbed);
    return;
  }

  intReply(
    i,
    smallEmbed(
      'Kaķa vārds veiksmīgi nomainīts\n' +
        `No: ${itemString('kakis', null, false, catPrev.attributes)}\n` +
        `Uz: **${itemString('kakis', null, false, res.newItem.attributes)}**`,
      0xffffff
    )
  );

  return { user: userAfter, newItem: res.newItem, error: false };
}

const kakis: UsableItemFunc = async (userId, guildId, _, specialItem) => ({
  custom: async (i, color) => {
    let currTime = Date.now();

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const row = components(user, specialItem!.attributes, currTime, false);

    const msg = await intReply(i, {
      content: row.length ? '\u200b' : undefined,
      embeds: embed(i, specialItem!.attributes, currTime),
      components: row,
      fetchReply: true,
    });

    if (!msg || !row.length) return;

    let hatModified = false;
    let selectedFood = '';

    buttonHandler(
      i,
      'izmantot',
      msg,
      async int => {
        const { customId, componentType } = int;

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const catInInv = user.specialItems.find(({ _id }) => _id === specialItem?._id);
        if (!catInInv) {
          intReply(int, ephemeralReply(`Šis kaķis vairs nav tavā inventārā`));
          return { end: true };
        }

        currTime = Date.now();

        if (customId === 'feed_cat_select' && componentType === ComponentType.StringSelect) {
          selectedFood = user.items.find(({ name }) => name === int.values[0]) ? int.values[0] : '';

          return {
            edit: {
              embeds: embed(i, catInInv.attributes, currTime),
              components: components(user, catInInv.attributes, currTime, hatModified, selectedFood),
            },
          };
        }

        if (componentType !== ComponentType.Button) return;

        if (customId === 'feed_cat_btn') {
          if (!selectedFood) return { error: true };

          const hasFood = user.items.find(({ name }) => name === selectedFood);

          if (!hasFood) {
            return {
              edit: {
                embeds: embed(i, specialItem!.attributes, currTime),
                components: components(user, specialItem!.attributes, currTime, hatModified),
              },
              after: () => {
                intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString(selectedFood)}**`));
              },
            };
          }

          if (catInInv.attributes!.fedUntil! < currTime) {
            return {
              edit: {
                embeds: embed(i, specialItem!.attributes, currTime),
                components: components(user, specialItem!.attributes, currTime, hatModified),
              },
              after: () => {
                intReply(int, 'Tu nevari pabarot šo kaķi, jo tas tikko nomira :(');
              },
            };
          }

          const { feedTimeMs } = kakisFoodData[selectedFood];
          const { fedUntil } = catInInv.attributes!;

          const newFedUntil = Math.min(currTime + KAKIS_MAX_FEED, feedTimeMs + fedUntil!);

          await addItems(userId, guildId, { [selectedFood]: -1 });
          const res = await editItemAttribute(userId, guildId, catInInv._id!, {
            ...catInInv.attributes!,
            fedUntil: newFedUntil,
          });
          if (!res) return { error: true };

          const { newItem, user: userAfter } = res;

          currTime = Date.now();

          return {
            edit: {
              embeds: embed(i, newItem.attributes, currTime),
              components: components(userAfter, newItem.attributes, currTime, hatModified),
            },
            after: () => {
              intReply(int, smallEmbed(`Tu pabaroji kaķi ar **${itemString(selectedFood, null, true)}**`, color));
              selectedFood = '';
            },
          };
        }

        // totāli nav kopēts kods no dīvainā burkāna
        if (customId === 'cat_change_name') {
          const nameTagInInv = user.items.find(({ name }) => name === 'kaka_parsaucejs');
          if (!nameTagInInv) {
            return {
              edit: {
                embeds: embed(i, catInInv.attributes, currTime),
                components: components(user, catInInv.attributes, currTime, hatModified, selectedFood),
              },
              after: () => intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString('kaka_parsaucejs')}**`)),
            };
          }

          await int.showModal(
            new ModalBuilder()
              .setCustomId(`cat_modal_${specialItem!._id}`)
              .setTitle('Mainīt kaķa nosaukumu')
              .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId('cat_modal_input')
                    .setLabel('Jaunais nosaukums')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)
                    .setMaxLength(10)
                )
              )
          );

          let userAfter: UserProfile | null = null;
          let newCat: SpecialItemInProfile | null = null;

          try {
            const modalInt = await int.awaitModalSubmit({
              filter: i => i.customId.startsWith('cat_modal'),
              time: 60_000,
            });
            const res = await handleCatModal(modalInt);
            if (!res || res.error) return { doNothing: true };

            userAfter = res.user;
            newCat = res.newItem;
          } catch (_) {
            return { doNothing: true };
          }

          currTime = Date.now();

          return {
            edit: {
              embeds: embed(i, newCat.attributes, currTime),
              components: components(userAfter, newCat.attributes, currTime, hatModified, selectedFood),
            },
            after: () => null,
          };
        }

        // totāli nav kopēts kods no pētnieka
        if (customId === 'cat_add_hat') {
          if (!user.items.find(({ name }) => name === 'salaveca_cepure')) {
            return {
              edit: {
                embeds: embed(i, catInInv.attributes, currTime),
                components: components(user, catInInv.attributes, currTime, hatModified, selectedFood),
              },
              after: () => intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString('salaveca_cepure')}**`)),
            };
          }

          await addItems(userId, guildId, { salaveca_cepure: -1 });
          const userAfter = await editItemAttribute(userId, guildId, catInInv._id!, {
            ...catInInv.attributes,
            hat: 'salaveca_cepure',
          });

          if (!userAfter) return { error: true };
          const newAttributes = userAfter.newItem.attributes;

          hatModified = true;
          currTime = Date.now();

          return {
            edit: {
              embeds: embed(i, newAttributes, currTime),
              components: components(userAfter.user, newAttributes, currTime, hatModified, selectedFood),
            },
            after: () =>
              intReply(int, smallEmbed(`Tu kaķim uzvilki **${itemString('salaveca_cepure', null, true)}**`, color)),
          };
        }

        if (customId === 'cat_remove_hat') {
          if (catInInv.attributes.hat !== 'salaveca_cepure') {
            return {
              end: true,
              after: () => intReply(int, ephemeralReply('Kļūda, šim kaķim nav uzvilkta cepure')),
            };
          }

          if (!countFreeInvSlots(user)) {
            return {
              end: true,
              after: () =>
                intReply(int, ephemeralReply('Tu nevari kaķim novilkt cepuri, jo tev nav brīvu vietu inventārā')),
            };
          }

          await addItems(userId, guildId, { salaveca_cepure: 1 });
          const userAfter = await editItemAttribute(userId, guildId, catInInv._id!, {
            ...catInInv.attributes,
            hat: '',
          });

          if (!userAfter) return { error: true };
          const newAttributes = userAfter.newItem.attributes;

          hatModified = true;
          currTime = Date.now();

          return {
            edit: {
              embeds: embed(i, newAttributes, currTime),
              components: components(userAfter.user, newAttributes, currTime, hatModified, selectedFood),
            },
            after: () =>
              intReply(
                int,
                smallEmbed(
                  `Tu kaķim novilki **${itemString('salaveca_cepure', null, true)}**, ` +
                    `un tā tika pievienota tavam inventāram`,
                  color
                )
              ),
          };
        }
      },
      60000
    );
  },
});

export default kakis;
