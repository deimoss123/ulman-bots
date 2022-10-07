import { ApplicationCommandOptionType, EmbedField } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import iconEmojis from '../../../embeds/iconEmojis';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import Command from '../../../interfaces/Command';
import getItemPrice from '../../../items/helpers/getItemPrice';
import itemList, { ItemCategory } from '../../../items/itemList';
import { ItemType, itemTypes } from '../inventars';
import maksekeresData from '../zvejot/makskeresData';
import infoAutocomplete from './infoAutocomplete';

const info: Command = {
  title: 'Info',
  description: 'Iegūt informāciju par kādu mantu',
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
  autocomplete: infoAutocomplete,
  async run(i) {
    const itemKey = i.options.getString('nosaukums')!;

    const itemObj = itemList[itemKey];
    if (!itemObj) {
      return i.reply(wrongKeyEmbed);
    }

    const itemType: ItemType = itemObj.attributes ? 'special' : itemObj.use ? 'usable' : 'not_usable';

    const fields: EmbedField[] = [
      {
        name: `Vērtība: ${latiString(itemObj.value)}`,
        value:
          (itemObj.customValue ? '⚠️ šīs mantas vērtība var \nmainīties atkarībā no atribūtiem\n' : '') +
          '\u200B\n' +
          `**Mantas tips:**\n${itemTypes[itemType].emoji} - ${itemTypes[itemType].text}\n\n`,
        inline: true,
      },
    ];

    if (itemObj.categories.includes(ItemCategory.VEIKALS)) {
      const { price, discount } = getItemPrice(itemKey);

      fields[0].value += `**Veikala cena:**\n ${latiString(price)}`;
      if (discount) {
        fields[0].value +=
          ` (ar **${Math.floor(discount * 100)}%** atlaidi)\n` + `Bez atlaides: ${latiString(itemObj.value * 2)}`;
      }
    } else if (itemObj.categories.includes(ItemCategory.TIRGUS)) {
      fields[0].value +=
        `**Tirgus cena:**\n` +
        (itemObj.tirgusPrice!.lati ? `${latiString(itemObj.tirgusPrice!.lati)} un\n` : '') +
        `${Object.entries(itemObj.tirgusPrice!.items)
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
        value: `>>> ${Object.keys(fishChances)
          .map(key => itemString(itemList[key]))
          .join('\n')}`,
        inline: true,
      });
    }

    i.reply(
      embedTemplate({
        i,
        color: this.color,
        title: `Info: ${itemString(itemObj)}`,
        description: 'Īss apraksts par mantu :^)',
        fields,
      })
    );
  },
};

export default info;
