import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import setUser from "@/db/setUser";
import { UsableItemFunc } from "@/types/Item";
import { UserStatus } from "@/types/UserProfile";

const piena_spainis: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const { status } = user;
  if (!Object.values(status).find((s) => s >= Date.now())) {
    return {
      text: "Tev nav neviena statusa ko noņemt",
    };
  }

  const newStatus: any = {};
  for (const key of Object.keys(statusList)) {
    newStatus[key] = 0;
  }

  await setUser(userId, guildId, { status: newStatus as UserStatus });
  await addItems(userId, guildId, { piena_spainis: -1 });

  return { text: "Tev tika noņemti visi statusi" };
};

export default piena_spainis;
