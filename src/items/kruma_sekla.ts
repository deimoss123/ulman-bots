import addItems from "@/db/addItems";
import checkUserSpecialItems from "@/utils/checkUserSpecialItems";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemString from "@/utils/strings/itemString";
import intReply from "@/utils/intReply";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import izmantotTitle from "@/utils/strings/izmantotTitle";

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const res = checkUserSpecialItems(user, "ogu_krums");

  if (!res.valid) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tu nevari iestādīt **${itemString("ogu_krums", null, true)}**, jo ${res.reason}`
    ));
  }

  const userAfter = await addItems(userId, guildId, { kruma_sekla: -1, ogu_krums: 1 });
  if (!userAfter) return intReply(i, errorEmbed);

  // prettier-ignore
  intReply(i, mainEmbed({ 
    i, 
    color: commandColors.izmantot, 
    title: izmantotTitle("kruma_sekla"),
    description: `Tu iestādīji **${itemString("ogu_krums", null, true)}**`
  }));
};

const kruma_sekla = item<UsableItem>({
  info: () =>
    `Ogu krūma sēklu var iestādīt, lai izaudzētu **${itemString("ogu_krums", null, true)}**\n` +
    `Iestādot krūma sēklu, tiks izvēlēti nejauši ogu krūma atribūti, piemēram, ogas tips, augšanas laiks, utt.`,
  addedInVersion: "4.3",
  nameNomVsk: "ogu kruma sēkla",
  nameNomDsk: "ogu krūma sēklas",
  nameAkuVsk: "ogu krūma sēklu",
  nameAkuDsk: "ogu krūma sēklas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("kruma_sekla"), // TODO
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 10,
  use,
});

export default kruma_sekla;
