import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import setUser from "@/db/setUser";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const userUbagotCooldown = user.timeCooldowns.findIndex((c) => c.name === "ubagot");
  const userStradatCooldown = user.timeCooldowns.findIndex((c) => c.name === "stradat");

  const timeCooldowns = user.timeCooldowns;

  if (userUbagotCooldown === -1) timeCooldowns.push({ name: "ubagot", lastUsed: 0 });
  else timeCooldowns[userUbagotCooldown] = { name: "ubagot", lastUsed: 0 };

  if (userStradatCooldown === -1) timeCooldowns.push({ name: "stradat", lastUsed: 0 });
  else timeCooldowns[userStradatCooldown] = { name: "stradat", lastUsed: 0 };

  await setUser(userId, guildId, { timeCooldowns });
  await addItems(userId, guildId, { piparkuka: -1 });

  return {
    text: "Tu izlaidi gaidīšanas laiku līdz nākamajai strādāšanai un ubagošanai",
  };
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
  removedOnUse: false,
  use,
});

export default piparkuka;
