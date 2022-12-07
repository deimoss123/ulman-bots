import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedField,
} from 'discord.js';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import iconEmojis from '../../../embeds/iconEmojis';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import Command from '../../../interfaces/Command';
import Item, { TirgusItem } from '../../../interfaces/Item';
import getDiscounts from '../../../items/helpers/getDiscounts';
import getItemPrice from '../../../items/helpers/getItemPrice';
import itemList, { ItemCategory } from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import { ItemType, itemTypes } from '../inventars';
import kamPiederRun from '../kamPieder/kamPiederRun';
import maksekeresData from '../zvejot/makskeresData';
import allItemAutocomplete from './allItemAutocomplete';

const info: Command = {
  description: 'Iegūt detalizētu informāciju par kādu mantu - vērtība, cena, tirgus cena, makšķeres informācija, utt.',
  color: commandColors.info,
  data: {
    name: 'info',
    description: 'Iegūt informāciju par kādu mantu',
    options: [
      {
        name: 'nosaukums',
        description: 'Mantas nosaukums',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  autocomplete: allItemAutocomplete('🔍'),
  async run(i) {
    const itemKey = i.options.getString('nosaukums')!;

    const itemObj = itemList[itemKey];
    if (!itemObj) {
      return intReply(i, wrongKeyEmbed);
    }

    const itemType: ItemType =
      'notSellable' in itemObj
        ? 'not_sellable'
        : 'attributes' in itemObj
        ? 'special'
        : 'use' in itemObj
        ? 'usable'
        : 'not_usable';

    const fields: EmbedField[] = [
      {
        name: `Vērtība: ${itemType === 'not_sellable' ? '??? lati' : latiString(itemObj.value)}`,
        value:
          ('customValue' in itemObj ? '⚠️ šīs mantas vērtība var \nmainīties atkarībā no atribūtiem\n' : '') +
          '\u200B\n' +
          `**Mantas tips:**\n${itemTypes[itemType].emoji} - ${itemTypes[itemType].text}`,
        inline: true,
      },
    ];

    if (itemObj.categories.includes(ItemCategory.VEIKALS)) {
      const discounts = await getDiscounts();
      if (!discounts) return intReply(i, errorEmbed);

      const { price, discount } = getItemPrice(itemKey, discounts);

      fields[0].value += `\n\n**Veikala cena:**\n ${latiString(price)}`;
      if (discount) {
        fields[0].value +=
          ` (ar **${Math.floor(discount * 100)}%** atlaidi)\n` + `Bez atlaides: ${latiString(itemObj.value * 2)}`;
      }
    } else if (itemObj.categories.includes(ItemCategory.TIRGUS)) {
      const tirgusPrice = (itemObj as Item & TirgusItem).tirgusPrice;

      fields[0].value +=
        `\n\n**Tirgus cena:**\n` +
        (tirgusPrice.lati ? `${latiString(tirgusPrice.lati)} un\n` : '') +
        `${Object.entries(tirgusPrice.items)
          .map(([key, amount]) => `> ${itemString(itemList[key], amount)}`)
          .join('\n')}`;
    }

    if (itemObj.categories.includes(ItemCategory.MAKSKERE)) {
      const { maxDurability, repairable, timeMinHours, timeMaxHours, fishChances } = maksekeresData[itemKey];
      const timeStr = timeMinHours === timeMaxHours ? `${timeMinHours}h` : `${timeMinHours}h - ${timeMaxHours}h`;

      fields[0].value +=
        `\n\n**Makšķeres informācija:**\n` +
        `Maksimālā izturība: ${maxDurability}\n` +
        `Zvejas laiks: ${timeStr}\n` +
        `Salabojama: ${repairable ? iconEmojis.checkmark : iconEmojis.cross}`;

      fields.push({
        name: 'Nocopējamās mantas:',
        value: `>>> ${Object.entries(fishChances)
          .filter(([, { chance }]) => chance !== 0)
          .map(([key]) => itemString(itemList[key]))
          .join('\n')}`,
        inline: true,
      });
    }

    const msg = await intReply(
      i,
      embedTemplate({
        i,
        color: this.color,
        title: `Info: ${itemString(itemObj)}`,
        description: itemObj.info
          ? typeof itemObj.info === 'string'
            ? itemObj.info
            : itemObj.info()
          : 'UlmaņBota veidotājs ir aizmirsis pievienot aprakstu šai mantai dritvai kociņ',
        thumbnail: itemObj.imgLink || undefined,
        fields,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('info-kam-pieder-btn')
              .setLabel('Kam pieder?')
              .setEmoji('👁️')
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      })
    );

    if (!msg) return intReply(i, errorEmbed);

    buttonHandler(i, 'info', msg, async int => {
      const { customId, componentType } = int;

      if (customId === 'info-kam-pieder-btn' && componentType === ComponentType.Button) {
        return {
          end: true,
          after: () => kamPiederRun(int, itemKey),
        };
      }
    });
  },
};

export default info;
