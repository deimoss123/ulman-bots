import {
  ActionRowBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
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

export default async function izmantotRun(
  i: CommandInteraction | ButtonInteraction,
  itemToUseKey: string,
  embedColor: number
): Promise<void> {
  const user = await findUser(i.user.id);
  if (!user) {
    await i.reply(errorEmbed);
    return;
  }

  const { items } = user;
  const itemToUse = itemList[itemToUseKey];

  const itemInInv = items.find(({ name }) => name === itemToUseKey);
  if (!itemInInv) {
    await i.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
    return;
  }

  if (itemToUse.removedOnUse) {
    const resUser = await addItems(i.user.id, { [itemToUseKey]: -1 });
    if (!resUser) {
      await i.reply(errorEmbed);
      return;
    }
  }

  const itemsToUseLeft = itemInInv.amount - 1;

  const res = await itemToUse.use!(i.user.id);
  const resFields = res.fields || [];

  const componentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('izmantot_velreiz')
      .setLabel(`Izmantot vēlreiz (${itemsToUseLeft})`)
      .setStyle(ButtonStyle.Primary)
  );

  const replyMessage = embedTemplate({
    i,
    color: res.color || embedColor,
    fields: [
      {
        name: `Izmantot: ${ItemString(itemToUse, null, true)}`,
        value: res.text,
        inline: false,
      },
      ...(resFields as any),
    ],
    components: itemsToUseLeft && itemToUse.removedOnUse ? [componentRow] : [],
  });

  const interactionReply = await i.reply(replyMessage);

  if (!itemsToUseLeft || !itemToUse.removedOnUse) return;

  await buttonHandler(
    i,
    'izmantot',
    interactionReply!,
    async (componentInteraction) => {
      if (componentInteraction.customId === 'izmantot_velreiz') {
        if (componentInteraction.componentType !== ComponentType.Button) return;

        let buttonStyle = ButtonStyle.Success;

        const userBeforeUse = await findUser(i.user.id);
        if (userBeforeUse) {
          if (!userBeforeUse.items.find((item) => item.name === itemToUseKey)) {
            buttonStyle = ButtonStyle.Danger;
          }
        }

        componentRow.setComponents(
          new ButtonBuilder()
            .setCustomId('izmantot_velreiz')
            .setLabel(`Izmantot vēlreiz (${itemsToUseLeft})`)
            .setStyle(buttonStyle)
            .setDisabled(true)
        );

        return {
          end: true,
          edit: { components: [componentRow] },
          after: async () => izmantotRun(componentInteraction, itemToUseKey, embedColor),
        };
      }

      return;
    },
    10000
  );
}
