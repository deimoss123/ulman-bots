import getAllUsers from "@/db/getAllUsers";
import commandColors from "@/utils/commandColors";
import Command from "@/types/Command";
import topData from "@/commands/top/topData";
import errorEmbed from "@/utils/embeds/errorEmbed";
import topView, { TopComponentId, TopState } from "@/commands/top/topView";
import findUser from "@/db/findUser";
import { SortDataProfileEntry, sortDataProfile, sortDataStats } from "@/commands/top/sortData";
import getStatsMany from "@/db/stats/getStatsMany";
import intReply from "@/utils/intReply";
import StatsProfile from "@/types/StatsProfile";
import UserProfile from "@/types/UserProfile";
import { InteractionEditReplyOptions } from "discord.js";
import { Dialogs } from "@/utils/dialogs";

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

    const defer = i.deferReply({ withResponse: true }).catch(console.error);

    const user = await findUser(userId, i.guildId!);
    if (!user) {
      await defer;
      return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
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
        return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
      }

      const { projection } = sort.sortDataObj;
      sort.allUsers = await getStatsMany(i.client.user.id, guildId, projection);
    } else {
      sort.sortDataObj = sortDataProfile[category];
      if (!sort.sortDataObj) {
        await defer;
        return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
      }

      const { projection } = sort.sortDataObj;
      sort.allUsers = await getAllUsers(i.client.user!.id, guildId, projection);
    }

    if (!sort.allUsers || !sort.sortDataObj) {
      await defer;
      return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
    }

    // @ts-ignore
    const sortedUsers = sort.allUsers.sort(sort.sortDataObj.sortFunc);
    const total = sort.sortDataObj.totalReduceFunc // @ts-ignore
      ? (sortedUsers.reduce(sort.sortDataObj.totalReduceFunc, 0) as number)
      : null;

    const usersToFetch = sortedUsers.slice(0, TOP_USERS_PER_PAGE * TOP_MAX_PAGES).map((user) => user.userId);
    if (!usersToFetch.includes(userId)) usersToFetch.push(userId);

    const hasComponents = sortedUsers.length > TOP_USERS_PER_PAGE;

    const totalPages =
      Math.ceil(sortedUsers.length / TOP_USERS_PER_PAGE) >= TOP_MAX_PAGES
        ? TOP_MAX_PAGES
        : Math.ceil(sortedUsers.length / TOP_USERS_PER_PAGE);

    type ArrayElementType<T> = T extends readonly (infer E)[] ? E : never;

    const intitialState: TopState<ArrayElementType<typeof sort.allUsers>> = {
      title: categoryTitle,
      currentPage: 0,
      totalPages,
      total,
      sortedUsers,
      hasComponents,
      // šajā failā ir tik daudz TS mocības, es atceros,
      // ka oriģināli top kodu rakstīju kādos 5os no rīta pēc 20 stundu koda rakstīšanas ar ļoti ciešu termiņu
      // kādreiz pārrakstīšu normālāk, bet ne šodien
      sortDataObj: sort.sortDataObj as SortDataProfileEntry<ArrayElementType<typeof sort.allUsers>>,
    };

    const [deferRes] = await Promise.all([defer, i.guild!.members.fetch({ user: usersToFetch })]);
    if (!deferRes || !deferRes.resource?.message) {
      return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
    }

    if (!hasComponents) {
      return i.editReply(topView(intitialState, i) as InteractionEditReplyOptions).catch((_) => _);
    }

    const dialogs = new Dialogs(i, intitialState, topView, "top", { time: 60000 });

    if (!(await dialogs.start(deferRes.resource.message))) {
      return i.editReply(errorEmbed as InteractionEditReplyOptions).catch((_) => _);
    }

    dialogs.onClick(async (int, state) => {
      if (!int.isButton()) return;

      if (state.currentPage < 0) {
        state.currentPage = 0;
      }

      if (state.currentPage >= dialogs.state.totalPages) {
        state.currentPage = dialogs.state.totalPages - 1;
      }

      switch (int.customId) {
        case TopComponentId.FirstPage:
          state.currentPage = 0;
          return { update: true };
        case TopComponentId.PrevPage:
          if (state.currentPage > 0) state.currentPage--;
          return { update: true };
        case TopComponentId.NextPage:
          if (state.currentPage < state.totalPages - 1) state.currentPage++;
          return { update: true };
        case TopComponentId.LastPage:
          state.currentPage = state.totalPages - 1;
          return { update: true };
      }
    });
  },
};

export default top;
