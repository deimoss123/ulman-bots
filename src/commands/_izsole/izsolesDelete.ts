import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import deleteAuction from "@/db/auction/deleteAuction";
import findAuctionById from "@/db/auction/findAuctionById";
import buttonHandler from "@/embeds/buttonHandler";
import embedTemplate from "@/embeds/embedTemplate";
import ephemeralReply from "@/embeds/ephemeralReply";
import errorEmbed from "@/embeds/errorEmbed";
import intReply from "@/utils/intReply";
import { izsoleItemString } from "@/commands/_izsole/izsoleEmbeds";

const deleteConfirmComponents = [
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("izsole_delete_yes").setLabel("Jā").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("izsole_delete_no").setLabel("Nē").setStyle(ButtonStyle.Danger),
  ),
];

export default async function izsolesDelete(i: ChatInputCommandInteraction) {
  const id = i.options.getString("id");
  if (!id) return intReply(i, errorEmbed);

  const izsole = await findAuctionById(id);
  if (!izsole) return intReply(i, ephemeralReply(`Izsole ar id \`${id}\` netika atrasta`));

  const msg = await intReply(
    i,
    embedTemplate({
      i,
      title: "❔ Vai tiešām izdzēst šo izsoli?",
      description: izsoleItemString(izsole),
      components: deleteConfirmComponents,
    }),
  );
  if (!msg) return;

  buttonHandler(i, "izsole", msg, async (int) => {
    const { customId } = int;
    if (int.componentType !== ComponentType.Button) return;

    switch (customId) {
      case "izsole_delete_yes": {
        const res = await deleteAuction(id);
        if (!res) return { error: true };

        return {
          end: true,
          edit: {
            embeds: embedTemplate({
              i,
              title: "🔴 Izsole izdzēsta",
              color: 0xee0000,
              description: izsoleItemString(izsole),
            }).embeds,
            components: [],
          },
        };
      }
      case "izsole_delete_no": {
        return {
          end: true,
          edit: {
            components: [],
          },
        };
      }
    }
  });
}
