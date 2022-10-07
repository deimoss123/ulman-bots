import Command from '../../../interfaces/Command';
import { ButtonStyle, CommandInteraction, ComponentType, Message } from 'discord.js';
import itemList, { ItemCategory } from '../../../items/itemList';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import commandColors from '../../../embeds/commandColors';
import itemString from '../../../embeds/helpers/itemString';
import buttonHandler from '../../../embeds/buttonHandler';
import veikalsComponents from './veikalsComponents';
import findUser from '../../../economy/findUser';
import pirktRun from '../pirkt/pirktRun';
import errorEmbed from '../../../embeds/errorEmbed';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import getItemPrice from '../../../items/helpers/getItemPrice';
import millisToReadableTime from '../../../embeds/helpers/millisToReadableTime';

const veikals: Command = {
  title: 'Veikals',
  description: 'Atvērt veikalu',
  color: commandColors.veikals,
  data: {
    name: 'veikals',
    description: 'Atvērt veikalu',
  },
  async run(i: CommandInteraction) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const shopItems = Object.entries(itemList)
      .filter(obj => obj[1].categories.includes(ItemCategory.VEIKALS))
      .sort((a, b) => b[1].value - a[1].value);

    const fields = shopItems.map(([key, item]) => {
      const itemPrice = getItemPrice(key);

      let name = itemString(item);
      if (itemPrice.discount) {
        name += ` -${Math.floor(itemPrice.discount * 100)}%`;
      }

      const price = itemPrice.discount
        ? `~~${item.value * 2}~~ **${itemPrice.price}** lati`
        : latiString(item.value * 2);

      return {
        name,
        value: `Cena: ${price}`,
        inline: false,
      };
    });

    const resetTime = new Date().setHours(20, 0, 0, 0);
    const timeUntilReset = resetTime - Date.now();

    const interactionReply = await i.reply(
      embedTemplate({
        i,
        title: 'Veikals',
        description:
          'Nopirkt preci: `/pirkt <nosaukums> <daudzums>\n`' +
          `Atlaides mainās katru dienu plkst. <t:${Math.floor(resetTime / 1000)}:t> ` +
          `(pēc ${millisToReadableTime(timeUntilReset)})`,
        color: this.color,
        fields,
        components: veikalsComponents(shopItems, user),
      })
    );

    let chosenItem = '';
    let chosenAmount = 1;

    await buttonHandler(
      i,
      'veikals',
      interactionReply! as Message,
      async componentInteraction => {
        switch (componentInteraction.customId) {
          case 'veikals_prece':
            if (componentInteraction.componentType !== ComponentType.SelectMenu) return;
            chosenItem = componentInteraction.values[0]!;

            return {
              edit: {
                components: veikalsComponents(shopItems, user, chosenItem, chosenAmount),
              },
            };

          case 'veikals_daudzums':
            if (componentInteraction.componentType !== ComponentType.SelectMenu) return;
            chosenAmount = parseInt(componentInteraction.values[0]!);

            return {
              edit: {
                components: veikalsComponents(shopItems, user, chosenItem, chosenAmount),
              },
            };

          case 'veikals_pirkt': {
            if (componentInteraction.componentType !== ComponentType.Button) return;

            let buttonStyle = ButtonStyle.Success;

            const userBeforeBuy = await findUser(userId, guildId);
            if (userBeforeBuy) {
              const totalCost = getItemPrice(chosenItem).price * chosenAmount;
              if (userBeforeBuy.lati < totalCost || countFreeInvSlots(userBeforeBuy) < chosenAmount) {
                buttonStyle = ButtonStyle.Danger;
              }
            }

            return {
              end: true,
              edit: {
                components: veikalsComponents(shopItems, user, chosenItem, chosenAmount, buttonStyle),
              },
              after: async () => pirktRun(componentInteraction, chosenItem, chosenAmount, commandColors.pirkt),
            };
          }
        }
      },
      60000
    );
  },
};

export default veikals;
