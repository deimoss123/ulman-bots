import { bold, ComponentType, EmbedBuilder } from 'discord.js';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import addSpecialItems from '../../../economy/addSpecialItems';
import addXp, { AddXpReturn } from '../../../economy/addXp';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setFishing from '../../../economy/setFishing';
import commandColors from '../../../embeds/commandColors';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import xpAddedEmbed from '../../../embeds/helpers/xpAddedEmbed';
import smallEmbed from '../../../embeds/smallEmbed';
import Command from '../../../interfaces/Command';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import maksekeresData from './makskeresData';
import syncFishing from './syncFishing';
import { Dialogs } from '../../../utils/Dialogs';
import zvejotView, { ComponentId, ZvejotState } from './zvejotView';
import mongoTransaction from '../../../utils/mongoTransaction';

export function calcRepairCost(itemKey: ItemKey, usesLeft: number) {
  const price = itemList[itemKey].value * 2;
  if (usesLeft <= 0) return price;

  const { maxDurability } = maksekeresData[itemKey];
  if (usesLeft === maxDurability) return 0;

  return Math.ceil(((maxDurability - usesLeft) / maxDurability) * price);
}

export const ZVEJOT_MIN_LEVEL = 0;

const zvejot: Command = {
  description: () =>
    'Copēt zivis DižLatvijas ūdeņos\n\n' +
    'Lai zvejotu tev ir nepieciešama makšķere, kad esi ieguvis makšķeri izvēlies to ar `/zvejot` komandu un sāc zvejot\n' +
    'Zvejošana notiek automātiski, līdz brīdim kad makšķerei beigsies izturība, vai arī zvejošanas inventārs ir pilns\n' +
    'Zvejošanas ietilpība ir **6**, bet to var palielināt sasniedzot noteiktus līmeņus\n' +
    'Katra nozvejotā manta dod **1** UlmaņPunktu\n\n' +
    'Par katru makšķeri var apskatīt zvejošanas informāciju ar komandu `/info`\n' +
    'Makšķeres ir atribūtu mantas - katrai makšķerei ir izturības atribūts kas ietekmē tās vērtību\n' +
    'Dažas makšķeres ir iespējams salabot par latiem vai nu tās izmantojot ar `/izmantot` komandu, vai arī caur `/zvejot`, kad tā ir izvēlēta zvejošanai',
  color: commandColors.zvejot,
  data: {
    name: 'zvejot',
    description: 'Copēt zivis DižLatvijas ūdeņos',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await syncFishing(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const initialState: ZvejotState = {
      user,
      selectedFishingRod: null,
      selectedFishingRodId: null,
    };

    const dialogs = new Dialogs<ZvejotState>(i, initialState, zvejotView, 'zvejot', { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async (int, state) => {
      switch (int.customId) {
        case ComponentId.SelectFishingRod: {
          if (int.componentType !== ComponentType.StringSelect) return;

          [state.selectedFishingRod, state.selectedFishingRodId] = int.values[0].split(' ');

          return { update: true };
        }
        case ComponentId.StartFishing: {
          if (int.componentType !== ComponentType.Button || !state.selectedFishingRod) return;

          const user = await findUser(userId, guildId);
          if (!user) return { error: true };

          const rod = user.specialItems.find(item => item._id === state.selectedFishingRodId);

          if (!rod) {
            state.user = user;
            state.selectedFishingRod = null;
            state.selectedFishingRodId = null;

            intReply(int, ephemeralReply('Hmmm, šī maksķere ir maģiski pazudusi no tava inventāra'));
            return { edit: true };
          }

          const { ok, values } = await mongoTransaction(session => [
            () => removeItemsById(userId, guildId, [state.selectedFishingRodId!], session),
            () => setFishing(userId, guildId, { selectedRod: rod.name, usesLeft: rod.attributes.durability! }, session),
            () => syncFishing(userId, guildId, true, true, undefined, session),
          ]);

          if (!ok) return { error: true };

          state.user = values[values.length - 1];
          state.selectedFishingRod = null;
          state.selectedFishingRodId = null;

          return { update: true };
        }
        case ComponentId.CollectFish: {
          if (int.componentType !== ComponentType.Button) return;

          const user = await syncFishing(userId, guildId);
          if (!user || !user.fishing.caughtFishes) return { error: true };

          const fishesToAdd = user.fishing.caughtFishes;
          const fishCount = Object.values(fishesToAdd).reduce((p, c) => p + c, 0);
          const xpToAdd = fishCount;

          const freeSlots = countFreeInvSlots(user);

          state.user = user;

          if (freeSlots < fishCount) {
            // prettier-ignore
            intReply(int, ephemeralReply(
              `Tev nav vietas inventārā lai savāktu **${fishCount}** mantas no copes\n` +
              `Tev ir **${freeSlots}** brīvas vietas`,
            ));

            return { edit: true };
          }

          const specialItemsToAdd = Object.entries(fishesToAdd).filter(([name]) => 'attributes' in itemList[name]);
          if (specialItemsToAdd.length) {
            for (const [name, amount] of specialItemsToAdd) {
              const checkRes = checkUserSpecialItems(user, name, amount);
              if (!checkRes.valid) {
                intReply(int, ephemeralReply(`Tu nevari savāk zveju, jo ${checkRes.reason}`));
                return { edit: true };
              }
            }
          }

          const { ok, values } = await mongoTransaction(session => [
            () => setFishing(userId, guildId, { caughtFishes: null }, session),
            () => addItems(userId, guildId, fishesToAdd, session),
            () => syncFishing(userId, guildId, true, false, undefined, session),
            () => addXp(userId, guildId, xpToAdd, session),
          ]);

          if (!ok) return { error: true };

          const leveledUser = values[values.length - 1] as AddXpReturn;
          state.user = leveledUser.user;

          intReply(int, {
            embeds: [
              new EmbedBuilder().setColor(this.color).setFields({
                name: 'Tu savāci copi:',
                value: Object.entries(fishesToAdd)
                  .map(([key, amount]) => `> ${itemString(itemList[key], amount, true)}`)
                  .join('\n'),
              }),
              xpAddedEmbed(leveledUser, xpToAdd, 'No zvejošanas tu ieguvi'),
            ],
          });

          return { edit: true };
        }
        case ComponentId.RemoveFishingRod: {
          if (int.componentType !== ComponentType.Button) return;

          const user = await syncFishing(userId, guildId);
          if (!user) return { error: true };

          const { fishing } = user;
          const { selectedRod, usesLeft } = fishing;

          state.user = user;

          if (!selectedRod) return { error: true };

          if (!countFreeInvSlots(user)) {
            intReply(int, ephemeralReply('Tu nevari noņemt maksķeri, jo tev ir pilns inventārs'));
            return { edit: true };
          }

          const checkRes = checkUserSpecialItems(user, selectedRod);
          if (!checkRes.valid) {
            intReply(int, ephemeralReply(`Tu nevari noņemt makšķeri, jo ${checkRes.reason}`));
            return { edit: true };
          }

          const specialItemObj = { name: selectedRod, attributes: { durability: usesLeft } };

          const { ok, values } = await mongoTransaction(session => [
            () => addSpecialItems(userId, guildId, [specialItemObj], session),
            () => setFishing(userId, guildId, { selectedRod: null, usesLeft: 0, futureFishList: [] }, session),
          ]);

          if (!ok) return { error: true };

          state.selectedFishingRod = null;
          state.selectedFishingRodId = null;
          state.user = values[values.length - 1];

          intReply(int, {
            embeds: [
              new EmbedBuilder()
                .setDescription('Tavam inventāram tika pievienota:')
                .setFields({
                  name: itemString(itemList[selectedRod]),
                  value: displayAttributes(specialItemObj),
                })
                .setColor(this.color),
            ],
          });

          return { edit: true };
        }
        case ComponentId.FixFishingRod: {
          if (int.componentType !== ComponentType.Button) return;
          const user = await syncFishing(userId, guildId);
          if (!user || !user.fishing.selectedRod) return { error: true };

          const selectedRod = user.fishing.selectedRod;

          state.user = user;

          if (!maksekeresData[selectedRod].repairable) {
            intReply(int, ephemeralReply(`${itemString(itemList[selectedRod])} nav salabojama`));
            return { edit: true };
          }

          const { fishing, lati } = user;

          const repairCost = calcRepairCost(fishing.selectedRod!, fishing.usesLeft);
          if (!repairCost) return { error: true };

          if (lati < repairCost) {
            // prettier-ignore
            intReply(int, ephemeralReply(
              `Tev nepietiek nauda lai salabotu makšķeri - ${latiString(repairCost, false, true)}\n` +
              `Tev ir ${latiString(lati, false, true)}`,
            ));

            return { edit: true };
          }

          const { maxDurability } = maksekeresData[fishing.selectedRod!];

          const { ok, values } = await mongoTransaction(session => [
            () => setFishing(userId, guildId, { usesLeft: maxDurability }, session),
            () => addLati(userId, guildId, -repairCost, session),
            () => syncFishing(userId, guildId, true, false, undefined, session),
          ]);

          if (!ok) return { error: true };

          state.user = values[values.length - 1];

          // prettier-ignore
          intReply(int, smallEmbed(
            `Tu salaboji ${bold(itemString(itemList[fishing.selectedRod!], null, true))} - ${latiString(repairCost)}`,
            this.color,
          ));

          return { edit: true };
        }
        case ComponentId.Refresh: {
          if (int.componentType !== ComponentType.Button) return;

          const user = await syncFishing(userId, guildId);
          if (!user) return { error: true };

          state.user = user;

          return { update: true };
        }
      }
    });
  },
};

export default zvejot;
