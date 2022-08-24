import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import UsableItemReturn from '../../interfaces/UsableItemReturn';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';
import itemList from '../itemList';

export const BURKANS_CHANGE_NAME_COST = 1000;

function makeComponents(lati: number) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('change_name_burkans')
        .setLabel(`Mainīt burkāna nosaukumu (${latiString(BURKANS_CHANGE_NAME_COST)})`)
        .setStyle(lati >= BURKANS_CHANGE_NAME_COST ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(lati < BURKANS_CHANGE_NAME_COST)
    ),
  ];
}

export default async function divainais_burkans(
  userId: string,
  specialItem?: SpecialItemInProfile
): Promise<UsableItemReturn> {
  return {
    text: '',
    custom: async (i, color) => {
      const res = await editItemAttribute(userId, specialItem!._id!, {
        ...specialItem!.attributes,
        timesUsed: specialItem!.attributes.timesUsed! + 1,
      });
      if (!res) return i.reply(errorEmbed);

      const msg = await i.reply(
        embedTemplate({
          i,
          color,
          fields: [
            {
              name: `Izmantot: ${itemString(
                itemList[specialItem!.name]!,
                null,
                true,
                specialItem!.attributes.customName
              )}`,
              value:
                'Tu nokodies dīvaino burkānu, **mmmm** tas bija ļoti garšīgs\n' +
                `Šis burkāns ir nokosts **${res.newItem.attributes.timesUsed!}** reizes`,
              inline: false,
            },
          ],
          components: makeComponents(res.user.lati),
        })
      );
      await buttonHandler(i, 'izmantot_burkans', msg, async (interaction) => {
        const { customId } = interaction;
        if (customId === 'change_name_burkans') {
          if (interaction.componentType !== ComponentType.Button) return;

          const user = await findUser(interaction.user.id);
          if (!user) return;

          if (user.lati < BURKANS_CHANGE_NAME_COST) {
            await i.reply(
              ephemeralReply(
                'Tev nepietiek naudas lai nomainītu burkāna nosaukumu\n' +
                  `Tev ir ${latiString(user.lati)}`
              )
            );
            return;
          }

          await interaction.showModal(
            new ModalBuilder()
              .setCustomId(`burkans_modal_${specialItem!._id}`)
              .setTitle('Mainīt dīvainā burkāna nosaukumu')
              .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId('burkans_modal_input')
                    .setLabel('Jaunais nosaukums')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)
                    .setMaxLength(10)
                )
              )
          );
          return { end: true };
        }
      });
    },
  };
}
