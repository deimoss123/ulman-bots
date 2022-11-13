import {
  ActionRowBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import addItems from '../../../economy/addItems';
import embedTemplate from '../../../embeds/embedTemplate';
import ItemString from '../../../embeds/helpers/itemString';
import itemList from '../../../items/itemList';
import buttonHandler from '../../../embeds/buttonHandler';
import { ButtonBuilder } from '@discordjs/builders';
import izmantotRunSpecial from './izmantotRunSpecial';
import { UsableItem } from '../../../interfaces/Item';
import intReply from '../../../utils/intReply';

export default async function izmantotRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemToUseKey: string,
  embedColor: number
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  const { items, specialItems } = user;
  const itemToUse = itemList[itemToUseKey];

  if ('attributes' in itemToUse) {
    const specialItemsInInv = specialItems.filter(({ name }) => name === itemToUseKey);
    if (!specialItemsInInv.length) {
      return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
    }
    return izmantotRunSpecial(i, itemToUseKey, specialItemsInInv, embedColor);
  }

  const itemInInv = items.find(({ name }) => name === itemToUseKey);
  if (!itemInInv) {
    return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
  }

  if ('removedOnUse' in itemToUse && itemToUse.removedOnUse) {
    const resUser = await addItems(userId, guildId, { [itemToUseKey]: -1 });
    if (!resUser) return intReply(i, errorEmbed);
  }

  const itemsToUseLeft = itemInInv.amount - 1;

  const res = await (itemToUse as UsableItem).use(userId, guildId, itemToUseKey);

  if ('error' in res) return intReply(i, errorEmbed);
  if ('custom' in res) return res.custom(i, embedColor);

  const resFields = res.fields || [];

  const componentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('izmantot_velreiz')
      .setLabel(`Izmantot vēlreiz (${itemsToUseLeft})`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(itemToUse.emoji || { name: '❓' })
  );

  const replyMessage = embedTemplate({
    i,
    color: res.color || embedColor,
    title: `Izmantot: ${ItemString(itemToUse, null, true)}`,
    description: res.text,
    fields: resFields,
    components: itemsToUseLeft && 'removedOnUse' in itemToUse && itemToUse.removedOnUse ? [componentRow] : [],
  });

  const msg = await intReply(i, replyMessage);

  if (!msg || !itemsToUseLeft || ('removedOnUse' in itemToUse && !itemToUse.removedOnUse)) return;

  buttonHandler(
    i,
    'izmantot',
    msg,
    async int => {
      if (int.customId === 'izmantot_velreiz') {
        if (int.componentType !== ComponentType.Button) return;

        let buttonStyle = ButtonStyle.Success;

        const userBeforeUse = await findUser(userId, guildId);
        if (userBeforeUse) {
          if (!userBeforeUse.items.find(item => item.name === itemToUseKey)) {
            buttonStyle = ButtonStyle.Danger;
          }
        }

        componentRow.setComponents(
          new ButtonBuilder()
            .setCustomId('izmantot_velreiz')
            .setLabel(`Izmantot vēlreiz (${itemsToUseLeft})`)
            .setStyle(buttonStyle)
            .setEmoji(itemToUse.emoji || { name: '❓' })
            .setDisabled(true)
        );

        return {
          end: true,
          edit: { components: [componentRow] },
          after: () => izmantotRun(int, itemToUseKey, embedColor),
        };
      }

      return;
    },
    10000
  );
}
