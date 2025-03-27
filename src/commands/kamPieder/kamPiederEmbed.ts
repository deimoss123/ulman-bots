import { APIEmbedField, ButtonInteraction, ChatInputCommandInteraction, EmbedField } from "discord.js";
import commandColors from "@/utils/commandColors";
import embedTemplate from "@/utils/embeds/embedTemplate";
import itemString from "@/utils/strings/itemString";
import { ItemKey } from "@/items/itemList";

export default function kamPiederEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemKey: ItemKey,
  fields: APIEmbedField[],
  total = 0,
) {
  const fieldss = fields as EmbedField[];

  return embedTemplate({
    i,
    color: commandColors.info,
    title: `Kam Pieder - ${itemString(itemKey)}`,
    description: fields.length
      ? `Servera cirkulācijā ir **${itemString(itemKey, total)}**`
      : `Šajā serverī nevienam nepieder **${itemString(itemKey)}**`,
    fields: fieldss,
  }).embeds;
}
