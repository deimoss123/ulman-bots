import { ModalSubmitInteraction } from 'discord.js';
import addLati from '../economy/addLati';
import editItemAttribute from '../economy/editItemAttribute';
import findUser from '../economy/findUser';
import ephemeralReply from '../embeds/ephemeralReply';
import errorEmbed from '../embeds/errorEmbed';
import itemString from '../embeds/helpers/itemString';
import latiString from '../embeds/helpers/latiString';
import smallEmbed from '../embeds/smallEmbed';
import itemList from '../items/itemList';
import { BURKANS_CHANGE_NAME_COST } from '../items/usableItems/divainais_burkans';

export default async function modalHandler(i: ModalSubmitInteraction) {
  if (!i.isFromMessage) return;
  if (i.customId.startsWith('burkans_modal')) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    if (user.lati < BURKANS_CHANGE_NAME_COST) {
      return i.reply(
        ephemeralReply(
          'Tev nepietiek naudas lai nomainītu burkāna nosaukumu\n' +
            `Tev ir ${latiString(user.lati)}`
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
}
