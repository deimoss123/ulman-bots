import { ActionRowBuilder, BaseInteraction, bold, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import maksekeresData from '../../commands/zvejot/makskeresData';
import { calcRepairCost } from '../../commands/zvejot/zvejot';
import addLati from '../../economy/addLati';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import commandColors from '../../embeds/commandColors';
import ephemeralReply from '../../embeds/ephemeralReply';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import smallEmbed from '../../embeds/smallEmbed';
import { AttributeItem, UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import UserProfile, { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import embedTemplate from '../../embeds/embedTemplate';
import { Dialogs } from '../../utils/Dialogs';
import errorEmbed from '../../embeds/errorEmbed';
import mongoTransaction from '../../utils/mongoTransaction';

export function makskereCustomValue(itemKey: string): AttributeItem<ItemAttributes>['customValue'] {
  return ({ durability }) => {
    const { value } = itemList[itemKey];
    const { maxDurability } = maksekeresData[itemKey];

    if (durability! <= 0) return 1;

    if (durability! < maxDurability) {
      return Math.floor((durability! / maxDurability) * value);
    }

    return value;
  };
}

type State = {
  user: UserProfile;
  itemKey: ItemKey;
  makskereInProfile: SpecialItemInProfile;
  repairCost: number;
  hasRepaired: boolean;
};

const enum ComponentId {
  FixFishingRod = 'izmantot_makskere_fix_fishing_rod',
}

function view(state: State, i: BaseInteraction) {
  const itemObj = itemList[state.itemKey];
  const { repairable, maxDurability } = maksekeresData[state.itemKey];

  const { durability } = state.makskereInProfile.attributes!;

  const canAfford = state.user.lati >= state.repairCost;

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.FixFishingRod)
        .setLabel(
          repairable
            ? `Salabot ${itemObj.nameAkuVsk} - ${latiString(state.repairCost)}${!canAfford ? ' (nevari atļauties)' : ''}`
            : `${capitalizeFirst(itemObj.nameNomVsk)} nav salabojama`,
        )
        .setStyle(
          state.hasRepaired ? ButtonStyle.Success : repairable && canAfford ? ButtonStyle.Primary : ButtonStyle.Danger,
        )
        .setDisabled(state.hasRepaired || !repairable || !canAfford)
        .setEmoji(itemObj.emoji() || '❓'),
    ),
  ];

  let description = `Makšķeres ir izmantojamas zvejošanai\nSāc zvejot ar komandu \`/zvejot\``;

  if (durability! >= maxDurability) {
    description += '\n\n💡 Ja makšķerei ir samazinājusies izturība, to var salabot ar šo pašu komandu';
  }

  return embedTemplate({
    i,
    title: `Izmantot: ${itemString(state.itemKey, null, true)}`,
    description,
    color: commandColors.izmantot,
    components: durability! < maxDurability ? components : [],
  });
}

const makskere: UsableItemFunc = async (userId, guildId, itemKey, specialItem) => {
  return {
    custom: async i => {
      const { attributes, _id } = specialItem!;
      const { maxDurability, repairable } = maksekeresData[itemKey];

      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const repairCost = calcRepairCost(itemKey, attributes.durability!);
      const itemObj = itemList[itemKey];

      const initialState: State = {
        user,
        itemKey,
        makskereInProfile: specialItem!,
        repairCost,
        hasRepaired: false,
      };

      const dialogs = new Dialogs(i, initialState, view, 'izmantot');

      if (!(await dialogs.start())) {
        return intReply(i, errorEmbed);
      }

      dialogs.onClick(async (int, state) => {
        if (!repairable) return;
        if (int.customId !== ComponentId.FixFishingRod || int.componentType !== ComponentType.Button) return;

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const { lati, specialItems } = user;

        if (lati < repairCost) {
          intReply(
            int,
            ephemeralReply(
              `Tev nepietiek nauda lai salabotu makšķeri - ${latiString(repairCost, false, true)}\n` +
                `Tev ir ${latiString(lati, false, true)}`,
            ),
          );
          return { end: true };
        }

        if (!specialItems.find(item => item._id === _id)) {
          intReply(int, ephemeralReply('Tavs inventāra saturs ir mainījies, šī makšķere vairs nav tavā inventārā'));
          return { end: true };
        }

        const { ok, values } = await mongoTransaction(session => [
          () => addLati(userId, guildId, -repairCost, session),
          () => editItemAttribute(userId, guildId, _id!, { durability: maxDurability }, session),
        ]);

        if (!ok) return { error: true };

        const userAfter = values[1];

        state.hasRepaired = true;

        intReply(
          int,
          smallEmbed(
            `Tu salaboji ${bold(itemString(itemObj, null, true))} - ${latiString(repairCost)}\n` +
              displayAttributes(userAfter.newItem),
            commandColors.izmantot,
          ),
        );
        return { edit: true, end: true };
      });
    },
  };
};

export default makskere;
