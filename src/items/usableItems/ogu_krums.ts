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
import { UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import { MAX_LEVEL } from '../../levelingSystem/levelsList';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import addItems from '../../economy/addItems';

interface OGA {
    name: string,
    time: number // milisekundes, jo deimoss tā taisija
}

export const auzdzejamasogas: OGA[] = [
    {
        name: "avene",
        time: 7_200_000 //2h
    },
    {
        name: "mellene",
        time: 7_200_000 //2h
    },
];

// krumu vertibu generesana
// reizinataja intervals 0-1 ik pa 0.1
const MIN_LAIKS = 300_000; // 5 min
const MAX_LAIKS = 600_000; // 10 min

const MIN_OGAS = 3;
const MAX_OGAS = 6;

export function getRandomOga() {
    const ogas: ItemKey[] = ['mellene', 'avene'];
    return ogas[Math.floor(Math.random() * ogas.length)];
}

export function getRandomGrowthTime() {
    // varbut nav efektivaaka metode, bet strada
    const randomInterval = Math.floor(Math.random() * 11); // generes no 0 - 10
    const result = randomInterval / 10; // izdalis genereto lai butu intervala no 0 - 1
    const skaitlis = (MAX_LAIKS - MIN_LAIKS) * result + MIN_LAIKS;
    return skaitlis
}

export function getRandomMaxOgas() {
    const rand = Math.floor(Math.random() * (MAX_OGAS - MIN_OGAS + 1)) + MIN_OGAS;
    return rand;
}


const ievaktOgasBtn = () =>
    new ButtonBuilder()
        .setLabel("Ievākt Ogas")
        .setCustomId("ievakt_ogas")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🖐")

const ogu_krums: UsableItemFunc = async (userId, guildId, _, specialItem) => {
    const AUGSANAS_ILGUMS = specialItem!.attributes.growthTime!;
    const lastUsed = specialItem!.attributes.lastUsed!;
    const OGAS_TIPS = specialItem!.attributes.berryType!;
    if(Date.now() - lastUsed < AUGSANAS_ILGUMS) {
        return {
            text:
                `Tavs ogu krūms vēl nav izaudzējis ogas...\n` +
                `Būs izaugušas pēc \`${millisToReadableTime(AUGSANAS_ILGUMS - Date.now() + lastUsed)}\``
        }
    }

    const user = await findUser(userId,guildId);
    if (!user) return {error:true};

    await editItemAttribute(userId,guildId, specialItem!._id!, {lastUsed: Date.now()});
    const userAfter = await addItems(userId,guildId,{OGAS_TIPS:1});
    if (!userAfter) return {error:true};

    return{
        text: `Nākamā oga pēc \`${millisToReadableTime(AUGSANAS_ILGUMS - 1)}\``,
        fields: [
            {
                name:"ga",
                value:`gu`,
                inline:true
            }
        ]
    }


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
}

export default ogu_krums;
