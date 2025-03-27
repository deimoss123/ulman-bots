import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import UserProfile from "@/types/UserProfile";
import itemList, { ItemKey } from "@/utils/itemList";
import { calcReqItems } from "@/commands/tirgus/tirgus";

export default function tirgusComponents(
  listings: ItemKey[],
  user: UserProfile,
  boughtItems: ItemKey[],
  selectedListing?: string,
) {
  const calcRes = selectedListing ? calcReqItems(user, itemList[selectedListing]) : null;
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("tirgus_select_menu")
        .setPlaceholder("Izvēlies tirgus preci")
        .addOptions(
          listings.map((key) => {
            const itemObj = itemList[key];
            return {
              label: capitalizeFirst(itemObj.nameNomVsk),
              emoji: itemObj.emoji() || "❓",
              value: key,
              default: key === selectedListing,
            };
          }),
        ),
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("tirgus_pirkt")
        .setLabel(
          "Pirkt " +
            (!selectedListing
              ? "(izvēlies preci)"
              : boughtItems.includes(selectedListing)
                ? "(prece jau nopirkta)"
                : !calcRes?.hasAll
                  ? "(nevari atļauties)"
                  : ""),
        )
        .setStyle(
          !selectedListing
            ? ButtonStyle.Secondary
            : !calcRes?.hasAll || boughtItems.includes(selectedListing)
              ? ButtonStyle.Danger
              : ButtonStyle.Primary,
        )
        .setDisabled(!selectedListing || !calcRes?.hasAll || boughtItems.includes(selectedListing)),
    ),
  ];
}
