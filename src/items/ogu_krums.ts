import addItems from "@/db/addItems";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import { item, AttributeItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import { SpecialItemInProfile } from "@/types/UserProfile";
import buttonHandler from "@/utils/buttonHandler";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import smallEmbed from "@/utils/embeds/smallEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import itemString from "@/utils/strings/itemString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import wrapString from "@/utils/strings/wrapString";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

//šis pavisam noteikti nebūs labs kods (ja salīdzina ar pārējo)
//praktiski visu šo šizofrēniju ir veidojis bumbotajs (ar "mazu" deimosa palīdzību)

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

const use: UsableAttributeItemFunc = async (i, _, __, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

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
    return intReply(
      i,
      mainEmbed({ i, description: `Diemžēl tavs krūms vairs nav starp mums... 💀⚰`, color: commandColors.izmantot }),
    );
  }

  if (!izaudzis) {
    if (!vajagApliet) {
      return intReply(
        i,
        mainEmbed({
          i,
          description: `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**`,
          color: commandColors.izmantot,
        }),
      );
    }
    const msg = await intReply(i, {
      embeds: mainEmbed({
        i,
        description:
          `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**\n` +
          `_(Ei, tu tur! Vispār tavs krūms ir izslāpis... 🥵)_`,
        color: commandColors.izmantot,
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
            embeds: mainEmbed({ i, description: `Tu aplaistīji ogu krūmu! 👍`, color: commandColors.izmantot }).embeds!,
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
        commandColors.izmantot,
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
    mainEmbed({
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
      color: commandColors.izmantot,
    }),
  );
};

type Attributes = {
  berryType: string;
  growthTime: number;
  maxBerries: number;
  lastUsed: number;
  apliets: number;
  iestadits: number;
  apliesanasReizes: number;
};

const ogu_krums = item<AttributeItem<Attributes>>({
  info:
    "Kļūsti par īstu dārznieku.\n" +
    "Katrs ogu krūms, ko iegūsti būs ar nejauši izvēlētu ogu tipu\n" +
    "(Tas tādēļ, jo biji ierāvis kamēr to stādiji)\n" +
    "Katram krūmam arī ir limitēts maksimālo ogu skaits (arī tiek nejauši izvēlēts)", // TODO`
  addedInVersion: "4.3",
  nameNomVsk: "ogu krūms",
  nameNomDsk: "ogu krūmi",
  nameAkuVsk: "ogu krūmu",
  nameAkuDsk: "ogu krūmus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("ogu_krums"),
  imgLink: "https://beanson.lv/images/krums.png",
  categories: [ItemCategory.OTHER],
  value: 400,
  //ak mans dievs... attributi nekad nebeidzas
  defaultAttributes: (currTime) => ({
    berryType: getRandomOga(),
    growthTime: getRandomGrowthTime(),
    maxBerries: getRandomMaxOgas(),
    lastUsed: 0,
    apliets: currTime,
    iestadits: currTime,
    apliesanasReizes: getRandomApliesanasReizes(),
  }),
  displayAttributes: (attributes, inline, currTime) => {
    const item = { name: "ogu_krums", attributes };
    const { maxBerries, berryType } = attributes;

    const { cikNakamaOga, sobridOgas } = dabutOguInfo(item, currTime);
    const { izaudzis, izaugsanasProg, vajagApliet } = dabutKrumaInfo(item, currTime);
    const cikOgasRadit = Math.min(sobridOgas, maxBerries!);

    if (izaudzis) {
      return (
        `Audzē - ${wrapString(capitalizeFirst(itemList[berryType].nameAkuDsk), "**", !inline)} ` +
        `${cikOgasRadit}/${maxBerries} ` +
        `${sobridOgas < maxBerries! ? millisToReadableTime(cikNakamaOga) : ""}`
      );
    }

    if (vajagApliet) {
      return `Krūms ir izslāpis! 🥵 ${izaugsanasProg}%`;
    }

    return `Krūms vēl aug... ${wrapString(izaugsanasProg, "**", !inline)}%, `;
  },
  use,
  sortBy: (attrA, attrB) => attrA.berryType.localeCompare(attrB.berryType),
});

export default ogu_krums;
