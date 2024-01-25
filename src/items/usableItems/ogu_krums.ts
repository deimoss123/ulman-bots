//šis pavisam noteikti nebūs labs kods (ja salīdzina ar pārējo)

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
import { UsableItemFunc, item } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import { MAX_LEVEL } from '../../levelingSystem/levelsList';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import addItems from '../../economy/addItems';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';

// gan jau vairs nevajadzes jo tagad ogu krumi balstiti uz veiksmi...
// interface OGA {
//   name: string;
//   time: number; // milisekundes, jo deimoss tā taisija
// }

// export const auzdzejamasogas: OGA[] = [
//   {
//     name: 'avene',
//     time: 7_200_000, //2h
//   },
//   {
//     name: 'mellene',
//     time: 7_200_000, //2h
//   },
// ];

//ogu rekinasana
//no currTime atnemt lastUsed un tad dalīt ar augasnas laiku
//tad laikam dabusu cik odzinas izaugusas...

// krumu vertibu generesana
// reizinataja intervals 0-1 ik pa 0.1
const MIN_LAIKS = 300_000; // 5 min
const MAX_LAIKS = 600_000; // 10 min

const MIN_OGAS = 3;
const MAX_OGAS = 6;

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
  const cikNakamaOga = lastUsed + (sobridOgas + 1) * attributes.growthTime! - currTime;
  return { sobridOgas, cikNakamaOga };
}

const ogu_krums: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const currTime = Date.now();
  const AUGSANAS_ILGUMS = specialItem!.attributes.growthTime!;
  const LAST_USED = specialItem!.attributes.lastUsed!;
  const OGAS_TIPS = specialItem!.attributes.berryType!;
  const { cikNakamaOga, sobridOgas } = dabutOguInfo(specialItem!, currTime);
  if (sobridOgas < 1) {
    return {
      text: `Tavs ogu krūms vēl nav izaudzējis ogas...\n` + `Izaugs pēc \`${millisToReadableTime(cikNakamaOga)}\``,
    };
  }

  const cikOgasDot = Math.min(sobridOgas, specialItem!.attributes.maxBerries!);

  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  await editItemAttribute(userId, guildId, specialItem!._id!, {
    ...specialItem?.attributes,

    lastUsed: sobridOgas >= specialItem!.attributes.maxBerries! ? currTime : currTime - AUGSANAS_ILGUMS + cikNakamaOga,
  });
  const userAfter = await addItems(userId, guildId, { [OGAS_TIPS]: cikOgasDot });
  if (!userAfter) return { error: true };
  const itemCount = userAfter.items.find(item => item.name === OGAS_TIPS)?.amount || 1;
  return {
    text: `Tu ievāci **${cikOgasDot}** ogas \n` + `Nākamā oga pēc \`${millisToReadableTime(cikNakamaOga)}\``,
    fields: [
      {
        name: 'Tu ievāci',
        value: `${itemString(OGAS_TIPS, cikOgasDot, true)}`,
        inline: true,
      },
      {
        name: 'Tev tagad ir',
        value: `${itemString(OGAS_TIPS, itemCount)}`,
        inline: true,
      },
    ],
  };

  // return {
  //     custom: async (i, color) => {
  //         const res = await editItemAttribute(userId, guildId, specialItem!._id!, {
  //             ...specialItem!.attributes,
  //             berryType: specialItem!.attributes!.berryType
  //         })
  //         if (!res) return intReply(i, errorEmbed);
  //         const { berryType } = res.newItem.attributes;
  //         const msg = await intReply(
  //             i, embedTemplate({
  //                 i, color, title: "Tu izmantoji ogu krūmu", description: `Tavs ogu krūms šobrīd audzē: **${berryType}s**`
  //             })
  //         )
  //         if (!msg) return;
  //     }

  // }
};

export default ogu_krums;
