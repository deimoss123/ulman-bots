import getAllUsers from "@/db/getAllUsers";
import commandColors from "@/utils/commandColors";
import Command from "@/types/Command";
import topData from "@/commands/top/topData";
import errorEmbed from "@/utils/embeds/errorEmbed";
import topEmbed from "@/commands/top/topEmbed";
import findUser from "@/db/findUser";
import { SortDataProfileEntry, sortDataProfile, sortDataStats } from "@/commands/top/sortData";
import getStatsMany from "@/db/stats/getStatsMany";
import intReply from "@/utils/intReply";
import StatsProfile from "@/types/StatsProfile";
import UserProfile from "@/types/UserProfile";
import buttonHandler from "@/utils/buttonHandler";
import btnPaginationRow from "@/items/helpers/btnPaginationRow";
import { ComponentType } from "discord.js";

export const TOP_USERS_PER_PAGE = 10;
export const TOP_MAX_PAGES = 10;

const top: Command = {
  description: () => "Apskatīt severa lietotāja topu",
  color: commandColors.top,
  data: topData,
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;
    // const guildId = '797584379685240882'; // okdd id

    const category = i.options.getString("kategorija")!;

    //@ts-ignore
    const categoryTitle = this.data.options[0].choices.find((c) => c.value === category).name as string;

    const isStatsCategory = category in sortDataStats ? true : category in sortDataProfile ? false : null;
    if (isStatsCategory === null) return intReply(i, errorEmbed);

    const defer = i.deferReply().catch((_) => _);

    const user = await findUser(userId, i.guildId!);
    if (!user) {
      await defer;
      return i.editReply(errorEmbed).catch((_) => _);
    }

    // @ts-ignore
    // prettier-ignore
    const sort: {
      allUsers: StatsProfile[] | undefined;
      sortDataObj: SortDataProfileEntry<StatsProfile>;
    } | {
      allUsers: UserProfile[] | undefined;
      sortDataObj: SortDataProfileEntry<UserProfile>;
    } = {};

    if (isStatsCategory) {
      sort.sortDataObj = sortDataStats[category];
      if (!sort.sortDataObj) {
        await defer;
        return i.editReply(errorEmbed).catch((_) => _);
      }

      const { projection } = sort.sortDataObj;
      sort.allUsers = await getStatsMany(i.client.user.id, guildId, projection);
    } else {
      sort.sortDataObj = sortDataProfile[category];
      if (!sort.sortDataObj) {
        await defer;
        return i.editReply(errorEmbed).catch((_) => _);
      }

      const { projection } = sort.sortDataObj;
      sort.allUsers = await getAllUsers(i.client.user!.id, guildId, projection);
    }

    if (!sort.allUsers) {
      await defer;
      return i.editReply(errorEmbed).catch((_) => _);
    }

    const { sortDataObj } = sort; // @ts-ignore
    const sortedUsers = sort.allUsers.sort(sortDataObj.sortFunc);

    const usersToFetch = sortedUsers.slice(0, TOP_USERS_PER_PAGE * TOP_MAX_PAGES).map((user) => user.userId);
    if (!usersToFetch.includes(userId)) usersToFetch.push(userId);

    await Promise.all([i.guild!.members.fetch({ user: usersToFetch }), defer]);

    if (sortedUsers.length <= TOP_USERS_PER_PAGE) {
      // @ts-ignore
      return i.editReply(topEmbed(i, categoryTitle, 0, sortedUsers, sortDataObj)).catch((_) => _);
    }

    let currentPage = 0;
    const totalPages =
      Math.ceil(sortedUsers.length / TOP_USERS_PER_PAGE) >= TOP_MAX_PAGES
        ? TOP_MAX_PAGES
        : Math.ceil(sortedUsers.length / TOP_USERS_PER_PAGE);

    const msg = await i
      .editReply({
        // @ts-ignore
        embeds: topEmbed(i, categoryTitle, currentPage, sortedUsers, sortDataObj).embeds,
        components: [btnPaginationRow("top", currentPage, totalPages)],
      })
      .catch();
    if (!msg) return;

    await buttonHandler(
      i,
      "top",
      msg,
      async (int) => {
        const { customId, componentType } = int;
        if (componentType !== ComponentType.Button) return;

        switch (customId) {
          case "top_first_page": {
            currentPage = 0;
            return {
              edit: {
                // @ts-ignore
                embeds: topEmbed(i, categoryTitle, currentPage, sortedUsers, sortDataObj).embeds,
                components: [btnPaginationRow("top", currentPage, totalPages)],
              },
            };
          }
          case "top_prev_page": {
            currentPage--;
            if (currentPage < 0) currentPage = 0;
            return {
              edit: {
                // @ts-ignore
                embeds: topEmbed(i, categoryTitle, currentPage, sortedUsers, sortDataObj).embeds,
                components: [btnPaginationRow("top", currentPage, totalPages)],
              },
            };
          }
          case "top_next_page": {
            currentPage++;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            return {
              edit: {
                // @ts-ignore
                embeds: topEmbed(i, categoryTitle, currentPage, sortedUsers, sortDataObj).embeds,
                components: [btnPaginationRow("top", currentPage, totalPages)],
              },
            };
          }
          case "top_last_page": {
            currentPage = totalPages - 1;
            return {
              edit: {
                // @ts-ignore
                embeds: topEmbed(i, categoryTitle, currentPage, sortedUsers, sortDataObj).embeds,
                components: [btnPaginationRow("top", currentPage, totalPages)],
              },
            };
          }
        }
      },
      60000,
    );
  },
};

export default top;
