import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import checkUserSpecialItems from "@/utils/checkUserSpecialItems";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemString from "@/utils/strings/itemString";

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const res = checkUserSpecialItems(user, "ogu_krums");

  if (!res.valid) {
    return {
      text: `Tu nevari iestādīt **${itemString("ogu_krums", null, true)}**, jo ${res.reason}`,
    };
  }

  await addItems(userId, guildId, { kruma_sekla: -1, ogu_krums: 1 });

  return {
    text: `Tu iestradāji ogu sēklu`,
  };
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
  emoji: () => emoji("kruma_sekla"), // TODO:
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 10,
  removedOnUse: false,
  use,
});

export default kruma_sekla;
