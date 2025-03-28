import addItems from "@/db/addItems";
import setUser from "@/db/setUser";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const userUbagotCooldown = user.timeCooldowns.findIndex((c) => c.name === "ubagot");
  const userStradatCooldown = user.timeCooldowns.findIndex((c) => c.name === "stradat");

  const timeCooldowns = user.timeCooldowns;

  if (userUbagotCooldown === -1) timeCooldowns.push({ name: "ubagot", lastUsed: 0 });
  else timeCooldowns[userUbagotCooldown] = { name: "ubagot", lastUsed: 0 };

  if (userStradatCooldown === -1) timeCooldowns.push({ name: "stradat", lastUsed: 0 });
  else timeCooldowns[userStradatCooldown] = { name: "stradat", lastUsed: 0 };

  const { ok } = await mongoTransaction((session) => [
    () => setUser(userId, guildId, { timeCooldowns }, session),
    () => addItems(userId, guildId, { piparkuka: -1 }, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  // prettier-ignore
  intReply(i, mainEmbed({
    i,
    color: commandColors.izmantot,
    title: izmantotTitle("piparkuka"),
    description: "Tu izlaidi gaidīšanas laiku līdz nākamajai strādāšanai un ubagošanai",
  }));
};

const piparkuka = item<UsableItem>({
  info:
    "Apēdot piparkūku tiks izlaists gaidīšanas laiks līdz nākamajai strādāšanas **un** ubagošanas reizei\n" +
    "Piparkūku var atrast ubagojot decembrī",
  addedInVersion: "4.2",
  nameNomVsk: "piparkūka",
  nameNomDsk: "piparkūkas",
  nameAkuVsk: "piparkūku",
  nameAkuDsk: "piparkūkas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("piparkuka"),
  imgLink: "https://www.ulmanbots.lv/images/items/piparkuka.png",
  categories: [ItemCategory.OTHER],
  value: 25,
  use,
});

export default piparkuka;
