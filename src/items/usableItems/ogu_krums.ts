//šis pavisam noteikti nebūs labs kods (ja salīdzina ar pārējo)
//praktiski visu šo šizofrēniju ir veidojis bumbotajs (ar "mazu" deimosa palīdzību)

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import buttonHandler from "@/utils/buttonHandler";
import embedTemplate from "@/utils/embeds/embedTemplate";
import errorEmbed from "@/utils/embeds/errorEmbed";
import itemString from "@/utils/strings/itemString";
import smallEmbed from "@/utils/embeds/smallEmbed";
import { UsableItemFunc, item } from "@/interfaces/Item";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/items/itemList";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import addItems from "@/db/addItems";
import { SpecialItemInProfile } from "@/interfaces/UserProfile";

//ogu rekinasana
//no currTime atnemt lastUsed un tad dalīt ar augasnas laiku un tad floorosu
//tad laikam dabusu cik odzinas izaugusas...

// krumu vertibu generesana
// reizinataja intervals 0-1 ik pa 0.1
// ogu augsanas laiks
const MIN_LAIKS = 3_600_000; // 1h
const MAX_LAIKS = 4_320_000; // 1.2h (80min)

// maksimalais un minimalais ogu daudzums vienam krumam
const MIN_OGAS = 3;
const MAX_OGAS = 6;

// pasa ogu kruma augsanas ilgums
// un arī krūma dzīves ilgums
// 3_600_000 1h
// 43_200_000 12h
const KRUMA_AUGSANAS_LAIKS = 43_200_000; //12h
const NOMIR = 1_9_0_080_00_00; // 22 dienas (smieklīgs formatējums)

// reizes cik krums jaaplaista augsanas procesa
// izlemu, ka aplaistisanas reizes ari varetu uzgenerte, jo tagad cilveki sapratis ka krums vienmer jaaplej
// tad, kad tas ir 25% izaudzis... (tas būtu pārāk mazs olu vēzis)
// const APLIESANAS_REIZES = 4;
const MIN_APLIESANAS_REIZES = 4;
const MAX_APLIESANAS_REIZES = 6;

export function getRandomApliesanasReizes() {
  const rand = Math.floor(Math.random() * (MAX_APLIESANAS_REIZES - MIN_APLIESANAS_REIZES + 1)) + MIN_APLIESANAS_REIZES;
  return rand;
}

// dabuju ogu tipu krumam
export function getRandomOga() {
  const ogas: ItemKey[] = ["mellene", "avene", "vinoga", "zemene", "janoga"];
  return ogas[Math.floor(Math.random() * ogas.length)];
}

// funkcija kas dabus nejausu ogu augsanas laiku
export function getRandomGrowthTime() {
  // varbut nav efektivaaka metode, bet strada
  const randomInterval = Math.floor(Math.random() * 11); // generes no 0 - 10
  const result = randomInterval / 10; // izdalis genereto lai butu intervala no 0 - 1
  const skaitlis = (MAX_LAIKS - MIN_LAIKS) * result + MIN_LAIKS;
  return skaitlis;
}

// nejausi izvelas cik krumam var maksimali izaugt ogas
export function getRandomMaxOgas() {
  const rand = Math.floor(Math.random() * (MAX_OGAS - MIN_OGAS + 1)) + MIN_OGAS;
  return rand;
}

// funkcija, ar kuru var dabut info par ogam (cik ilgi lidz nakamajai, cik ogas ir sobrid)
export function dabutOguInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const lastUsed = attributes.lastUsed!;

  const izaudzis = Math.min(currTime, attributes.apliets!) > attributes.iestadits! + KRUMA_AUGSANAS_LAIKS;

  let startGrowthTime: number;

  if (lastUsed === 0 && izaudzis) {
    startGrowthTime = attributes.iestadits! + KRUMA_AUGSANAS_LAIKS;
  } else {
    startGrowthTime = lastUsed;
  }

  const laikaStarpiba = currTime - startGrowthTime;
  const sobridOgas = Math.floor(laikaStarpiba / attributes.growthTime!);
  //lastused + (sobridogas + 1) * growthtime - curtime
  // es isti nezinu ko sis viss nozime
  const cikNakamaOga = startGrowthTime + (sobridOgas + 1) * attributes.growthTime! - currTime;

  return { sobridOgas, cikNakamaOga };
}

// nez cik laba si funckija izrekinas laiku, bet butu jastrada
export function apliesanasLaiks({ attributes }: SpecialItemInProfile) {
  const augsanasLaiks = KRUMA_AUGSANAS_LAIKS;
  const aplietLaiks = augsanasLaiks / attributes.apliesanasReizes!;
  return aplietLaiks;
}

// kruma info funkcija
export function dabutKrumaInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const augsanasLaiks = KRUMA_AUGSANAS_LAIKS;
  const iestadits = attributes.iestadits!;
  const apliets = attributes.apliets!;
  const cikIlgiAug = currTime - iestadits; // testesanai
  const izaugsanasProg = Math.floor(((Math.min(currTime, apliets) - iestadits) / augsanasLaiks) * 100);

  //hmmmm sitais neizskatas parak labi
  // dievs lūdzu saki, ka šis strādā      - bumbotajs
  let izaudzis = false;
  Math.min(currTime, apliets) > iestadits + augsanasLaiks ? (izaudzis = true) : (izaudzis = false); // deimosam nepatik, bet man patik

  const vajagApliet = apliets <= currTime;

  return { izaudzis, cikIlgiAug, izaugsanasProg, augsanasLaiks, vajagApliet };
}
//????
function makeComponents() {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("apliet_krumu")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("💧")
        .setLabel("Apliet Krūmu"),
    ),
  ];
}

const ogu_krums: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    custom: async (i, color) => {
      const currTime = Date.now();
      // stulba attributu siena
      const oguAgusanasIlgums = specialItem!.attributes.growthTime!;
      const lastUsed = specialItem!.attributes.lastUsed!;
      const ogasTips = specialItem!.attributes.berryType!;
      const aplaistits = specialItem!.attributes.apliets!;
      const iestadisanasLaiks = specialItem!.attributes.iestadits!;
      const krumaAugsanasLaiks = KRUMA_AUGSANAS_LAIKS;
      const { cikNakamaOga, sobridOgas } = dabutOguInfo(specialItem!, currTime);
      const { izaugsanasProg, izaudzis, vajagApliet } = dabutKrumaInfo(specialItem!, currTime);

      if (iestadisanasLaiks + NOMIR < currTime) {
        return intReply(i, embedTemplate({ i, description: `Diemžēl tavs krūms vairs nav starp mums... 💀⚰`, color }));
      }

      if (!izaudzis) {
        if (!vajagApliet) {
          return intReply(
            i,
            embedTemplate({ i, description: `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**`, color }),
          );
        }
        const msg = await intReply(i, {
          embeds: embedTemplate({
            i,
            description:
              `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**\n` +
              `_(Ei, tu tur! Vispār tavs krūms ir izslāpis... 🥵)_`,
            color,
          }).embeds!,
          components: makeComponents(),
          fetchReply: true,
        });
        if (!msg) return;

        buttonHandler(i, "izmantot", msg, async (int) => {
          const sobridLaiks = Date.now();
          const { customId } = int;

          if (int.componentType !== ComponentType.Button) return;

          if (customId === "apliet_krumu") {
            await editItemAttribute(userId, guildId, specialItem!._id!, {
              ...specialItem?.attributes,
              iestadits: sobridLaiks - aplaistits + iestadisanasLaiks,
              apliets: sobridLaiks + apliesanasLaiks(specialItem!),
            });
            return {
              edit: {
                embeds: embedTemplate({ i, description: `Tu aplaistīji ogu krūmu! 👍`, color }).embeds!,
                components: [],
              },
            };
          }
        });
        return;
      }

      if (sobridOgas < 1) {
        return intReply(
          i,
          smallEmbed(
            `Tavs ogu krūms vēl nav izaudzējis ogas...\n` + `Izaugs pēc \`${millisToReadableTime(cikNakamaOga)}\``,
            0xff0000,
          ),
        );
      }

      const cikOgasDot = Math.min(sobridOgas, specialItem!.attributes.maxBerries!);

      const user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const afterEdit = await editItemAttribute(userId, guildId, specialItem!._id!, {
        ...specialItem?.attributes,

        lastUsed:
          sobridOgas >= specialItem!.attributes.maxBerries! ? currTime : currTime - oguAgusanasIlgums + cikNakamaOga,
      });
      const userAfter = await addItems(userId, guildId, { [ogasTips]: cikOgasDot });
      if (!userAfter || !afterEdit) return intReply(i, errorEmbed);
      const { cikNakamaOga: cikNakamaOgaJauns } = dabutOguInfo(afterEdit.newItem, currTime);
      const itemCount = userAfter.items.find((item) => item.name === ogasTips)?.amount || 1;
      return intReply(
        i,
        embedTemplate({
          i,
          description:
            `Tu ievāci **${cikOgasDot}** ogas \n` + `Nākamā oga pēc \`${millisToReadableTime(cikNakamaOgaJauns)}\``,
          fields: [
            {
              name: "Tu ievāci:",
              value: `${itemString(ogasTips, cikOgasDot, true)}`,
              inline: true,
            },
            {
              name: "Tev tagad ir:",
              value: `${itemString(ogasTips, itemCount)}`,
              inline: true,
            },
          ],
          color,
        }),
      );
    },
  };
};

export default ogu_krums;
