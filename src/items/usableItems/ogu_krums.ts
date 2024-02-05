//šis pavisam noteikti nebūs labs kods (ja salīdzina ar pārējo)
//praktiski visu šo šizofrēniju ir veidojis bumbotajs (ar "mazu" deimosa palīdzību)

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
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
import { UsableItemFunc, item } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import { MAX_LEVEL } from '../../levelingSystem/levelsList';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import addItems from '../../economy/addItems';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';

//ogu rekinasana
//no currTime atnemt lastUsed un tad dalīt ar augasnas laiku un tad floorosu
//tad laikam dabusu cik odzinas izaugusas...

// krumu vertibu generesana
// reizinataja intervals 0-1 ik pa 0.1
const MIN_LAIKS = 10000; // 5 min
const MAX_LAIKS = 10000; // 10 min

// maksimalais un minimalais ogu daudzums vienam krumam
const MIN_OGAS = 3;
const MAX_OGAS = 6;

// pasa ogu kruma augsanas ilgums (velak koda pieskaitu klat ogu augsanas ilgumu)
// 3_600_000 1h
const BAZES_KRUMA_AUGSANAS_LAIKS = 60_000; //1h
const NOMIR = 1_90_080_00_00; // 20 dienas

// dabuju ogu tipu krumam
export function getRandomOga() {
  const ogas: ItemKey[] = ['mellene', 'avene', 'vinoga'];
  return ogas[Math.floor(Math.random() * ogas.length)];
}

export function getRandomGrowthTime() {
  // varbut nav efektivaaka metode, bet strada
  const randomInterval = Math.floor(Math.random() * 11); // generes no 0 - 10
  const result = randomInterval / 10; // izdalis genereto lai butu intervala no 0 - 1
  const skaitlis = (MAX_LAIKS - MIN_LAIKS) * result + MIN_LAIKS;
  return skaitlis;
}

export function getRandomMaxOgas() {
  const rand = Math.floor(Math.random() * (MAX_OGAS - MIN_OGAS + 1)) + MIN_OGAS;
  return rand;
}

export function dabutOguInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const lastUsed = attributes.lastUsed!;
  const laikaStarpiba = currTime - lastUsed;
  const sobridOgas = Math.floor(laikaStarpiba / attributes.growthTime!);
  //lastused + (sobridogas + 1) * growthtime - curtime
  // es isti nezinu ko sis viss nozime
  const cikNakamaOga = lastUsed + (sobridOgas + 1) * attributes.growthTime! - currTime;

  return { sobridOgas, cikNakamaOga };
}

export function apliesanasLaiks() {
  return 15000;
}

export function dabutKrumaInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const augsanasLaiks = BAZES_KRUMA_AUGSANAS_LAIKS + attributes.growthTime!;
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

function makeComponents() {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('apliet_krumu')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💧')
        .setLabel('Apliet Krūmu')
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
      const krumaAugsanasLaiks = BAZES_KRUMA_AUGSANAS_LAIKS + oguAgusanasIlgums;
      const { cikNakamaOga, sobridOgas } = dabutOguInfo(specialItem!, currTime);
      const { izaugsanasProg, izaudzis, vajagApliet } = dabutKrumaInfo(specialItem!, currTime);

      if (iestadisanasLaiks + NOMIR < currTime) {
        return intReply(i, embedTemplate({ i, description: `Diemžēl tavs krūms vairs nav starp mums... 💀⚰`, color }));
      }

      if (!izaudzis) {
        if (!vajagApliet) {
          return intReply(
            i,
            embedTemplate({ i, description: `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**`, color })
          );
        }
        const msg = await intReply(i, {
          embeds: embedTemplate({
            i,
            description:
              `Tavs krūms vēl nav izaudzis! **${izaugsanasProg}%**\n` + `_(Ei! Vispār tavs krūms ir izslāpis... 🥵)_`,
            color,
          }).embeds!,
          components: makeComponents(),
          fetchReply: true,
        });
        if (!msg) return;

        buttonHandler(i, 'izmantot', msg, async int => {
          const sobridLaiks = Date.now();
          const { customId } = int;
          if (int.componentType !== ComponentType.Button) return;

          if (customId === 'apliet_krumu') {
            await editItemAttribute(userId, guildId, specialItem!._id!, {
              ...specialItem?.attributes,
              iestadits: sobridLaiks - aplaistits + iestadisanasLaiks,
              apliets: sobridLaiks + apliesanasLaiks(),
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
            0xff0000
          )
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
      const itemCount = userAfter.items.find(item => item.name === ogasTips)?.amount || 1;
      return intReply(
        i,
        embedTemplate({
          i,
          description:
            `Tu ievāci **${cikOgasDot}** ogas \n` + `Nākamā oga pēc \`${millisToReadableTime(cikNakamaOgaJauns)}\``,
          fields: [
            {
              name: 'Tu ievāci:',
              value: `${itemString(ogasTips, cikOgasDot, true)}`,
              inline: true,
            },
            {
              name: 'Tev tagad ir:',
              value: `${itemString(ogasTips, itemCount)}`,
              inline: true,
            },
          ],
          color,
        })
      );
    },
  };
};

export default ogu_krums;
