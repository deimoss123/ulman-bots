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
import { UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList from '../itemList';

const BURKANS_CHANGE_NAME_COST = 250;

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
  const user = await findUser(i.user.id, i.guildId!);
  if (!user) return intReply(i, errorEmbed);

  if (user.lati < BURKANS_CHANGE_NAME_COST) {
    return intReply(
      i,
      ephemeralReply('Tev nepietiek naudas lai nomainītu burkāna nosaukumu\n' + `Tev ir ${latiString(user.lati)}`)
    );
  }

  const burkansId = i.customId.substring('burkans_modal_'.length);
  const newName = i.fields.getTextInputValue('burkans_modal_input').trim();

  const burkansPrev = user.specialItems.find(item => item._id === burkansId);
  if (!burkansPrev) return intReply(i, errorEmbed);

  if (newName === burkansPrev.attributes.customName) {
    return intReply(i, ephemeralReply('Jaunajam burkāna vārdam ir jāatšķiras no vecā'));
  }

  const res = await editItemAttribute(i.user.id, i.guildId!, burkansId, {
    ...burkansPrev.attributes,
    customName: newName,
  });
  if (!res) return intReply(i, errorEmbed);
  await addLati(i.user.id, i.guildId!, -BURKANS_CHANGE_NAME_COST);

  intReply(
    i,
    smallEmbed(
      'Burkāna nosakums veiksmīgi nomainīts\n' +
        `No: ${itemString(itemList.divainais_burkans, null, false, burkansPrev.attributes)}\n` +
        `Uz: **${itemString(itemList.divainais_burkans, null, false, res.newItem.attributes)}**`,
      0xffffff
    )
  );
}

const divainais_burkans: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    custom: async (i, color) => {
      const res = await editItemAttribute(userId, guildId, specialItem!._id!, {
        ...specialItem!.attributes,
        timesUsed: specialItem!.attributes.timesUsed! + 1,
      });
      if (!res) return intReply(i, errorEmbed);

      const { timesUsed } = res.newItem.attributes;

      const msg = await intReply(
        i,
        embedTemplate({
          i,
          color,
          title: `Izmantot: ${itemString(itemList[specialItem!.name]!, null, true, specialItem!.attributes)}`,
          description:
            'Tu nokodies dīvaino burkānu, **mmmm** tas bija ļoti garšīgs\n' +
            `Šis burkāns ir nokosts **${res.newItem.attributes.timesUsed!}** ` +
            `reiz${timesUsed! % 10 === 1 && timesUsed! % 100 !== 11 ? 'i' : 'es'}`,
          components: makeComponents(res.user.lati),
        })
      );

      if (!msg) return;

      buttonHandler(
        i,
        'izmantot_burkans',
        msg,
        async int => {
          const { customId } = int;
          if (customId === 'change_name_burkans') {
            if (int.componentType !== ComponentType.Button) return;

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

            if (user.lati < BURKANS_CHANGE_NAME_COST) {
              intReply(
                int,
                ephemeralReply(
                  'Tev nepietiek naudas lai nomainītu burkāna nosaukumu\n' + `Tev ir ${latiString(user.lati)}`
                )
              );
              return { end: true };
            }

            await int.showModal(
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
            int
              .awaitModalSubmit({
                filter: i => i.customId.startsWith('burkans_modal'),
                time: 60_000,
              })
              .then(handleModal)
              .catch(_ => _);
            return { end: true };
          }
        },
        20000
      );
    },
  };
};

export default divainais_burkans;
