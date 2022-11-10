import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import createAuction from '../../../economy/auction/createAuction';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { ItemAttributes } from '../../../interfaces/UserProfile';
import itemList from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import { confirmNewIzsoleMsg, izsoleItemString } from './izsoleEmbeds';

function millisFromStr(str: string): number | null {
  const [dayMonth, minutesSeconds] = str.trim().split(' ');

  const [day, month] = dayMonth.trim().split('/');
  const [hours, minutes] = minutesSeconds.trim().split(':');

  if ([day, month, hours, minutes].includes('') || [+day, +month, +hours, +minutes].includes(NaN)) {
    return null;
  }

  const date = new Date(0).setFullYear(2022, +month, +day);
  const date2 = new Date(date).setHours(+hours, +minutes, 0, 0);
  return date2;
}

export default async function izsoleCreate(i: ChatInputCommandInteraction) {
  const itemKey = i.options.getString('name');
  if (!itemKey) return intReply(i, errorEmbed);

  const itemObj = itemList[itemKey];
  if (!itemObj) {
    return intReply(i, ephemeralReply('Šāda manta neeksistē'));
  }

  const amount = i.options.getInteger('amount') ?? 1;
  const startPrice = i.options.getInteger('start_price')!;

  const startDate = millisFromStr(i.options.getString('start_date')!);
  const endDate = millisFromStr(i.options.getString('end_date')!);

  if (startDate === null) {
    return intReply(i, ephemeralReply('Nepareizi ievadīts sākuma datums/laiks'));
  }

  if (endDate === null) {
    return intReply(i, ephemeralReply('Nepareizi ievadīts beigu datums/laiks'));
  }

  let attributes: ItemAttributes | null = null;
  let interaction: ChatInputCommandInteraction | ModalSubmitInteraction = i;

  if ('attributes' in itemObj) {
    await i.showModal(
      new ModalBuilder()
        .setCustomId(`izsole_new_modal_${itemKey}`)
        .setTitle(`Atribūti - ${itemObj.nameNomVsk}`)
        .addComponents(
          ...Object.keys(itemObj.attributes).map(key =>
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              new TextInputBuilder().setCustomId(key).setLabel(key).setStyle(TextInputStyle.Short)
            )
          )
        )
    );

    const modalRes = await i
      .awaitModalSubmit({ filter: i => i.customId === `izsole_new_modal_${itemKey}`, time: 60_000 })
      .catch(() => null);
    if (!modalRes) return;

    attributes = Object.fromEntries(
      Object.entries(itemObj.attributes).map(([key, attr]) => {
        const value = modalRes.fields.getTextInputValue(key);
        return [key, typeof attr === 'string' ? value : +value];
      })
    );

    console.log(attributes);

    interaction = modalRes;
  }

  const msg = await intReply(
    interaction,
    confirmNewIzsoleMsg(i, itemKey, amount, attributes, startPrice, startDate, endDate)
  );
  if (!msg) return intReply(interaction, errorEmbed);

  buttonHandler(interaction, 'izsole', msg, async int => {
    const { customId } = int;
    if (int.componentType !== ComponentType.Button) return;

    switch (customId) {
      case 'izsole_create_yes': {
        const newAuction = await createAuction(itemKey, amount, attributes, startPrice, startDate, endDate);
        if (!newAuction) return { error: true };

        return {
          end: true,
          edit: {
            embeds: embedTemplate({
              i,
              title: '✅ Izveidota jauna izsole',
              description: izsoleItemString(newAuction),
              color: 0x00cc00,
            }).embeds,
            components: [],
          },
        };
      }
      case 'izsole_create_no': {
        return {
          edit: {
            end: true,
            components: [],
          },
        };
      }
    }
  });
}
