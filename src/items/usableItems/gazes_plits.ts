import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  StringSelectMenuBuilder,
} from 'discord.js';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import Item, { UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import embedTemplate from '../../embeds/embedTemplate';
import { Dialogs } from '../../utils/Dialogs';
import itemList, { ItemKey } from '../itemList';
import UserProfile from '../../interfaces/UserProfile';
import itemString from '../../embeds/helpers/itemString';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import commandColors from '../../embeds/commandColors';
import { calcIevarijumsPrice } from './ievarijums';
import { BerryProperties, berryProperties, propertiesLat } from './oga';
import ephemeralReply from '../../embeds/ephemeralReply';
import smallEmbed from '../../embeds/smallEmbed';
import editItemAttribute from '../../economy/editItemAttribute';
import addItems from '../../economy/addItems';

export type GazesPlitsActionType = '' | 'cook' | 'boil_ievarijums' | 'boil_special_ievarijums';

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

type BerryInInv = {
  name: ItemKey;
  amount: number;
  itemObj: Item;
};

type State = {
  user: UserProfile;

  selectedMenu: null | 'cook' | 'boil';

  boil: {
    berriesInInv: BerryInInv[];
    selectedBerry: ItemKey;
    chosenBerries: Record<ItemKey, number>;
    combinedProperties: Record<keyof BerryProperties, number>;
  };
};

function makeCombinedProperties(chosenBerries: Record<ItemKey, number>) {
  const combinedProperties: Record<keyof BerryProperties, number> = {
    saldums: 0,
    skabums: 0,
    rugtums: 0,
    slapjums: 0,
  };

  Object.keys(chosenBerries).forEach(berry => {
    const properties = berryProperties[berry];
    Object.keys(properties).forEach(prop => {
      // @ts-ignore
      combinedProperties[prop] += properties[prop] * chosenBerries[berry];
    });
  });

  return combinedProperties;
}

function getBoilDuration() {
  return 60 * 1000; // 1 min
}

function view(state: State, i: BaseInteraction) {
  if (!state.selectedMenu) {
    return embedTemplate({
      i,
      title: `Izmantot: ${itemString('gazes_plits')}`,
      color: commandColors.izmantot,
      description: 'Ko tu vēlies darīt?',
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('plits_select_menu_cook').setLabel('Cept').setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('plits_select_menu_boil')
            .setLabel('Vārīt ievārījumu')
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
  }

  if (state.selectedMenu === 'boil') {
    if (!state.boil.berriesInInv.length) {
      return embedTemplate({
        i,
        color: commandColors.izmantot,
        description: 'Tev inventārā nav ogu ko vārīt',
      });
    }

    let description = '';

    if (!Object.keys(state.boil.chosenBerries).length) {
      description = 'No izvēlnes izvēlies ogas, kuras pievienot vārīšanai';
    } else {
      const { distance, value, normalizedDistance } = calcIevarijumsPrice(state.boil.combinedProperties);
      description += `Distance: ${distance} \nVērtība: ${value} lati \nNormalized distance: ${normalizedDistance}`;
    }

    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('plits_select_berry')
          .setPlaceholder('Izvēlies ogu')
          .addOptions(
            ...state.boil.berriesInInv // @ts-ignore jo stringu salīdzināšana
              .toSorted((a, b) => a.name > b.name)
              .map(({ name, itemObj, amount }) => ({
                label: `${capitalizeFirst(itemObj.nameNomVsk)} (tev ir ${amount})`,
                description:
                  `Sald. ${berryProperties[name].saldums} | ` +
                  `Skāb. ${berryProperties[name].skabums} | ` +
                  `Rūgt. ${berryProperties[name].rugtums} | ` +
                  `Slapj. ${berryProperties[name].slapjums}`,
                value: name,
                emoji: itemObj.emoji || '❓',
                default: name === state.boil.selectedBerry,
              })),
          ),
      ),
    ];

    if (state.boil.selectedBerry) {
      const selectedBerryInInv = state.boil.berriesInInv.find(({ name }) => name === state.boil.selectedBerry)!;

      const row = [
        new ButtonBuilder()
          .setCustomId('plits_add_berry')
          .setLabel('Mest katlā')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(selectedBerryInInv.amount <= state.boil.chosenBerries[state.boil.selectedBerry]),
      ];

      if (state.boil.chosenBerries[state.boil.selectedBerry] > 0) {
        row.push(
          new ButtonBuilder()
            .setCustomId('plits_remove_berry')
            .setLabel(`Izņemt ${selectedBerryInInv.itemObj.nameAkuDsk}`)
            .setStyle(ButtonStyle.Danger),
        );
      }

      if (Object.keys(state.boil.chosenBerries).length) {
        row.push(
          new ButtonBuilder()
            .setCustomId('plits_remove_all_berries')
            .setLabel('Izņemt visas ogas')
            .setStyle(ButtonStyle.Danger),
        );
      }

      components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(row));

      const totalBerryCount = Object.values(state.boil.chosenBerries).reduce((a, b) => a + b, 0);

      components.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('plits_boil_ievarijums')
            .setLabel('Vārīt')
            .setStyle(totalBerryCount < 3 ? ButtonStyle.Secondary : ButtonStyle.Success)
            .setDisabled(totalBerryCount < 3),
        ),
      );
    }

    return embedTemplate({
      i,
      title: `${itemString('gazes_plits')} - Vārīt ievārījumu`,
      color: commandColors.izmantot,
      description,
      fields: [
        {
          name: 'Izvēlētās ogas',
          value: Object.entries(state.boil.chosenBerries) // @ts-ignore jo stringu salīdzināšana
            .toSorted((a, b) => a[0] > b[0])
            .map(([key, amount]) => `${itemString(key)}: ${amount}`)
            .join('\n'),
          inline: false,
        },
        {
          name: 'Kombinētās īpašības',
          value: Object.keys(state.boil.combinedProperties)
            .map(
              prop =>
                // neliela TS putra
                `${propertiesLat[prop as keyof BerryProperties]}: ` +
                `${state.boil.combinedProperties[prop as keyof BerryProperties]}`,
            )
            .join('\n'),
          inline: false,
        },
      ],
      components,
    });
  }

  // TODO: uztaisīt cepšanu
  if (state.selectedMenu === 'cook') {
    return embedTemplate({
      i,
      description: 'Cept',
    });
  }

  // šim nekad nevajadzētu notikt, bet atgriežu, lai TS nebļauj
  return embedTemplate({ i, description: 'ja tu redzi šo ziņu, tad kaut kas ir nogājis galīgi greizi' });
}

const gazes_plits: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    custom: async i => {
      const user = await findUser(userId, guildId);

      if (!user || !specialItem) {
        return intReply(i, errorEmbed);
      }

      const berriesInInv: BerryInInv[] = [];

      Object.keys(berryProperties).forEach(berry => {
        const inInv = user.items.find(({ name }) => name === berry);
        if (inInv && inInv.amount > 0) {
          berriesInInv.push({ name: berry, amount: inInv.amount, itemObj: itemList[berry] });
        }
      });

      const defaultState: State = {
        user,
        selectedMenu: null,
        boil: {
          berriesInInv,
          selectedBerry: '',
          chosenBerries: {},
          combinedProperties: makeCombinedProperties({}),
        },
      };

      const dialogs = new Dialogs(i, defaultState, view, 'izmantot_gazes_plits', { time: 60000 });

      if (!(await dialogs.start())) {
        return intReply(i, errorEmbed);
      }

      dialogs.onClick(async int => {
        const { customId, componentType: type } = int;

        // pirmā izvēlne ========================================
        if (customId === 'plits_select_menu_cook' && type === ComponentType.Button) {
          dialogs.state.selectedMenu = 'cook';
          return { update: true };
        }

        if (customId === 'plits_select_menu_boil' && type === ComponentType.Button) {
          dialogs.state.selectedMenu = 'boil';

          if (!dialogs.state.boil.berriesInInv.length) {
            return { update: true, end: true };
          }

          return { update: true };
        }

        // vārīšana ========================================
        if (customId === 'plits_select_berry' && type === ComponentType.StringSelect) {
          dialogs.state.boil.selectedBerry = int.values[0];
          return { update: true };
        }

        if (customId === 'plits_add_berry' && type === ComponentType.Button) {
          const selectedBerry = dialogs.state.boil.selectedBerry;
          if (!selectedBerry) return { errror: true };

          if (dialogs.state.boil.chosenBerries[selectedBerry]) {
            dialogs.state.boil.chosenBerries[selectedBerry]++;
          } else {
            dialogs.state.boil.chosenBerries[selectedBerry] = 1;
          }

          dialogs.state.boil.combinedProperties = makeCombinedProperties(dialogs.state.boil.chosenBerries);

          return { update: true };
        }

        if (customId === 'plits_remove_berry' && type === ComponentType.Button) {
          const selectedBerry = dialogs.state.boil.selectedBerry;

          if (!selectedBerry || !dialogs.state.boil.chosenBerries[selectedBerry]) {
            return { errror: true };
          }

          delete dialogs.state.boil.chosenBerries[selectedBerry];
          dialogs.state.boil.combinedProperties = makeCombinedProperties(dialogs.state.boil.chosenBerries);
          // dialogs.state.boil.selectedBerry = '';

          return { update: true };
        }

        if (customId === 'plits_remove_all_berries' && type === ComponentType.Button) {
          dialogs.state.boil.chosenBerries = {};
          dialogs.state.boil.combinedProperties = makeCombinedProperties({});
          dialogs.state.boil.selectedBerry = '';

          return { update: true };
        }

        if (customId === 'plits_boil_ievarijums' && type === ComponentType.Button) {
          const user = await findUser(userId, guildId);
          if (!user) return { error: true };

          // pārbaudam, vai plīts ir inventarā
          const isPlitsInInv = user.specialItems.find(({ _id }) => _id === specialItem._id);
          if (!isPlitsInInv) {
            await intReply(int, ephemeralReply(`Kļūda: Šī **${itemString('gazes_plits')}** vairs nav tavā inventārā`));
            return { end: true };
          }

          // pārbauda, vai izvēlētās ogas ir inventarā
          let hasInInv = true;
          for (const [key, amount] of Object.entries(dialogs.state.boil.chosenBerries)) {
            const inInv = user.items.find(({ name }) => name === key);
            if (!inInv || inInv.amount < amount) {
              hasInInv = false;
              break;
            }
          }

          if (!hasInInv) {
            await intReply(
              int,
              ephemeralReply(
                'Kļūda: Tava inventāra saturs ir mainījies, tev nav nepieciešamo ogu, lai uzvārītu šo ievārījumu',
              ),
            );
            return { end: true };
          }

          const itemsToRemove = Object.fromEntries(
            Object.entries(dialogs.state.boil.chosenBerries).map(([key, amount]) => [key, -amount]),
          );

          await addItems(userId, guildId, itemsToRemove);

          await editItemAttribute(userId, guildId, specialItem._id!, {
            actionType: 'boil_ievarijums',
            boilIevarijums: {
              boilStarttime: Date.now(),
              boilDuration: getBoilDuration(),
              berries: dialogs.state.boil.chosenBerries,
              properties: dialogs.state.boil.combinedProperties,
            },
          });

          intReply(int, smallEmbed('Ievārījuma vārīšana uzsākta veiksmīgi!', commandColors.izmantot));
          return { end: true };
        }

        return;
      });
    },
  };
};

export default gazes_plits;
