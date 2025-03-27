import Command from "@/interfaces/Command";
import { ApplicationCommandOptionType } from "discord.js";
import embedTemplate from "@/utils/embeds/embedTemplate";
import itemString from "@/utils/strings/itemString";
import addItem from "@/db/addItems";
import wrongKeyEmbed from "@/utils/embeds/wrongKeyEmbed";
import itemList from "@/items/itemList";
import intReply from "@/utils/intReply";
import allItemAutocomplete from "@/commands/info/allItemAutocomplete";

const _addItem: Command = {
  devOnly: true,
  description: () => "Pievienot mantu inventārā",
  color: 0xffffff,
  data: {
    name: "additem",
    description: "Pievienot mantu inventārā",
    options: [
      {
        name: "lietotājs",
        description: "Lietotājs kam pievienot lietu",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "nosaukums",
        description: "Kādu lietu pievienot",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: "daudzums",
        description: "Cik lietas pievienot",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },
  autocomplete: allItemAutocomplete("⛔"),
  async run(i) {
    const target = i.options.getUser("lietotājs")!;
    const itemToAddKey = i.options.getString("nosaukums")!;
    const amountToAdd = i.options.getInteger("daudzums")!;

    const itemToAdd = itemList[itemToAddKey];
    if (!itemToAdd) {
      return intReply(i, wrongKeyEmbed);
    }

    await addItem(target.id, i.guildId!, { [itemToAddKey]: amountToAdd });

    intReply(
      i,
      embedTemplate({
        i,
        description: `Tu pievienoji <@${target.id}> ${itemString(itemToAdd, amountToAdd, true)}`,
        color: this.color,
      }),
    );
  },
};

export default _addItem;
