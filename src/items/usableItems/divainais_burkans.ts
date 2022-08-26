import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import addLati from '../../economy/addLati';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import smallEmbed from '../../embeds/smallEmbed';
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

async function handleModal(i: ModalSubmitInteraction) {
  const user = await findUser(i.user.id);
  if (!user) return i.reply(errorEmbed);

  if (user.lati < BURKANS_CHANGE_NAME_COST) {
    return i.reply(
      ephemeralReply(
        'Tev nepietiek naudas lai nomainītu burkāna nosaukumu\n' + `Tev ir ${latiString(user.lati)}`
      )
    );
  }

  const burkansId = i.customId.substring('burkans_modal_'.length);
  const newName = i.fields.getTextInputValue('burkans_modal_input').trim();

  const burkansPrev = user.specialItems.find((item) => item._id === burkansId);
  if (!burkansPrev) return i.reply(errorEmbed);

  if (newName === burkansPrev.attributes.customName) {
    return i.reply(ephemeralReply('Jaunajam burkāna vārdam ir jāatšķiras no vecā'));
  }

  const res = await editItemAttribute(i.user.id, burkansId, {
    ...burkansPrev.attributes,
    customName: newName,
  });
  if (!res) return i.reply(errorEmbed);
  await addLati(i.user.id, -BURKANS_CHANGE_NAME_COST);

  await i.reply(
    smallEmbed(
      'Burkāna nosakums veiksmīgi nomainīts\n' +
        `No: ${itemString(
          itemList.divainais_burkans,
          null,
          false,
          burkansPrev.attributes.customName
        )}\n` +
        `Uz: **${itemString(
          itemList.divainais_burkans,
          null,
          false,
          res.newItem.attributes.customName
        )}**`,
      0xffffff
    )
  );
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
          interaction
            .awaitModalSubmit({
              filter: (i) => i.customId.startsWith('burkans_modal'),
              time: 60_000,
            })
            .then(handleModal)
            .catch((_) => _);
          return { end: true };
        }
      });
    },
  };
}
