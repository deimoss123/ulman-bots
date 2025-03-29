import { BaseInteraction } from "discord.js";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import StatsProfile from "@/types/StatsProfile";
import UserProfile from "@/types/UserProfile";
import { displayPlace } from "@/commands/statistika/statistika";
import { SortDataProfileEntry } from "@/commands/top/sortData";
import { TOP_USERS_PER_PAGE } from "@/commands/top/top";
import emoji from "@/utils/emoji";
import btnPaginationRow from "@/utils/embeds/btnPaginationRow";

export type TopState<T extends UserProfile | StatsProfile> = {
  title: string;
  currentPage: number;
  totalPages: number;
  total: number | null;
  sortedUsers: T[];
  hasComponents: boolean;
  sortDataObj: SortDataProfileEntry<T>;
};

export const enum TopComponentId {
  FirstPage = "top_first_page",
  PrevPage = "top_prev_page",
  NextPage = "top_next_page",
  LastPage = "top_last_page",
}

function topView<T extends UserProfile | StatsProfile>(state: TopState<T>, i: BaseInteraction) {
  const { sortDataObj, total, sortedUsers, currentPage, title, hasComponents, totalPages } = state;
  const { displayValue, partOfTotal, topDescription } = sortDataObj;

  const offset = TOP_USERS_PER_PAGE * currentPage;
  const slicedUsers = sortedUsers.slice(offset, offset + TOP_USERS_PER_PAGE);

  const fields = slicedUsers.map((user, index) => {
    return {
      name:
        (user.userId === i.user.id ? `${emoji("icon_top_arrow")} ` : "") +
        `${displayPlace(index + offset)} ${
          i.guild!.members.cache.get(user.userId)?.user.tag || "Nezināms lietotājs"
        } ` +
        (total ? `\`${(partOfTotal!(total, user) * 100).toFixed(2)}%\`` : ""),
      value: displayValue(user),
      inline: false,
    };
  });

  const indexOf = sortedUsers.findIndex((u) => u.userId === i.user.id);

  if (!slicedUsers.find((u) => u.userId === i.user.id)) {
    const foundUser = sortedUsers.find((user) => user.userId === i.user.id)!;

    fields[fields.length - 1].value += `\n__${"\u2800".repeat(20)}__`;
    fields.push({
      name:
        `${emoji("icon_top_arrow")} ${displayPlace(indexOf)} ${i.user.tag} ` +
        (total ? `\`${(partOfTotal!(total, foundUser) * 100).toFixed(2)}%\`` : ""),
      value: displayValue(foundUser),
      inline: false,
    });
  }

  return mainEmbed({
    i,
    description: total ? topDescription!(total) : undefined,
    color: commandColors.top,
    title: `Servera tops | ${title}`,
    fields,
    components: hasComponents ? [btnPaginationRow("top", currentPage, totalPages)] : [],
  });
}

export default topView;
