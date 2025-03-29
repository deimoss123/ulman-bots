import { bold, ComponentType, EmbedBuilder } from "discord.js";
import addItems from "@/db/addItems";
import addLati from "@/db/addLati";
import addSpecialItems from "@/db/addSpecialItems";
import addXp, { AddXpReturn } from "@/db/addXp";
import findUser from "@/db/findUser";
import removeItemsById from "@/db/removeItemsById";
import setFishing from "@/db/setFishing";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import xpAddedEmbed from "@/utils/embeds/xpAddedEmbed";
import smallEmbed from "@/utils/embeds/smallEmbed";
import Command from "@/types/Command";
import checkUserSpecialItems from "@/utils/checkUserSpecialItems";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import itemList, { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import maksekeresData from "@/commands/zvejot/makskeresData";
import syncFishing from "@/commands/zvejot/syncFishing";
import { Dialogs } from "@/utils/dialogs";
import zvejotView, { ComponentId, ZvejotState } from "@/commands/zvejot/zvejotView";
import mongoTransaction from "@/utils/mongoTransaction";
import { AttributeItem } from "@/types/Item";

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
    "Copēt zivis DižLatvijas ūdeņos\n\n" +
    "Lai zvejotu tev ir nepieciešama makšķere, kad esi ieguvis makšķeri izvēlies to ar `/zvejot` komandu un sāc zvejot\n" +
    "Zvejošana notiek automātiski, līdz brīdim kad makšķerei beigsies izturība, vai arī zvejošanas inventārs ir pilns\n" +
    "Zvejošanas ietilpība ir **6**, bet to var palielināt sasniedzot noteiktus līmeņus\n" +
    "Katra nozvejotā manta dod **1** UlmaņPunktu\n\n" +
    "Par katru makšķeri var apskatīt zvejošanas informāciju ar komandu `/info`\n" +
    "Makšķeres ir atribūtu mantas - katrai makšķerei ir izturības atribūts kas ietekmē tās vērtību\n" +
    "Dažas makšķeres ir iespējams salabot par latiem vai nu tās izmantojot ar `/izmantot` komandu, vai arī caur `/zvejot`, kad tā ir izvēlēta zvejošanai",
  color: commandColors.zvejot,
  data: {
    name: "zvejot",
    description: "Copēt zivis DižLatvijas ūdeņos",
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

    const dialogs = new Dialogs<ZvejotState>(i, initialState, zvejotView, "zvejot", { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async (int, state) => {
      switch (int.customId) {
        case ComponentId.SelectFishingRod: {
          if (int.componentType !== ComponentType.StringSelect) return;

          [state.selectedFishingRod, state.selectedFishingRodId] = int.values[0].split(" ");

          return { update: true };
        }
        case ComponentId.StartFishing: {
          if (int.componentType !== ComponentType.Button || !state.selectedFishingRod) return;

          const user = await findUser(userId, guildId);
          if (!user) return { error: true };

          const rod = user.specialItems.find((item) => item._id === state.selectedFishingRodId);

          if (!rod) {
            state.user = user;
            state.selectedFishingRod = null;
            state.selectedFishingRodId = null;

            intReply(int, ephemeralReply("Hmmm, šī maksķere ir maģiski pazudusi no tava inventāra"));
            return { edit: true };
          }

          const { ok, values } = await mongoTransaction((session) => [
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

          const specialItemsToAdd = Object.entries(fishesToAdd).filter(
            ([name]) => "defaultAttributes" in itemList[name],
          );
          if (specialItemsToAdd.length) {
            for (const [name, amount] of specialItemsToAdd) {
              const checkRes = checkUserSpecialItems(user, name, amount);
              if (!checkRes.valid) {
                intReply(int, ephemeralReply(`Tu nevari savāk zveju, jo ${checkRes.reason}`));
                return { edit: true };
              }
            }
          }

          const { ok, values } = await mongoTransaction((session) => [
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
                name: "Tu savāci copi:",
                value: Object.entries(fishesToAdd)
                  .map(([key, amount]) => `> ${itemString(itemList[key], amount, true)}`)
                  .join("\n"),
              }),
              xpAddedEmbed(leveledUser, xpToAdd, "No zvejošanas tu ieguvi"),
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
            intReply(int, ephemeralReply("Tu nevari noņemt maksķeri, jo tev ir pilns inventārs"));
            return { edit: true };
          }

          const checkRes = checkUserSpecialItems(user, selectedRod);
          if (!checkRes.valid) {
            intReply(int, ephemeralReply(`Tu nevari noņemt makšķeri, jo ${checkRes.reason}`));
            return { edit: true };
          }

          const specialItemObj = { name: selectedRod, attributes: { durability: usesLeft } };

          const { ok, values } = await mongoTransaction((session) => [
            () => addSpecialItems(userId, guildId, [specialItemObj], session),
            () => setFishing(userId, guildId, { selectedRod: null, usesLeft: 0, futureFishList: [] }, session),
          ]);

          if (!ok) return { error: true };

          state.selectedFishingRod = null;
          state.selectedFishingRodId = null;
          state.user = values[values.length - 1];

          const itemObj = itemList[selectedRod] as AttributeItem;

          intReply(int, {
            embeds: [
              new EmbedBuilder()
                .setDescription("Tavam inventāram tika pievienota:")
                .setFields({
                  name: itemString(itemObj),
                  value: itemObj.displayAttributes(specialItemObj.attributes, false, Date.now()),
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

          const { ok, values } = await mongoTransaction((session) => [
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
