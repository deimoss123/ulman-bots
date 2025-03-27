import { ApplicationCommandOptionType } from "discord.js";
import findAuctionById from "@/db/auction/findAuctionById";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import Command from "@/types/Command";
import izsoleEmbed from "@/commands/_izsole/izsoleEmbed";
import intReply from "@/utils/intReply";
import allItemAutocomplete from "@/commands/info/allItemAutocomplete";
import izsoleCreate from "@/commands/_izsole/izsoleCreate";
import izsoleList from "@/commands/_izsole/IzsoleList";
import izsolesDelete from "@/commands/_izsole/izsolesDelete";

const izsole: Command = {
  devOnly: true,
  description: () => "",
  color: 0xffffff,
  data: {
    name: "izsole",
    description: "izsole",
    options: [
      {
        name: "create",
        description: "Izveidot jaunu izsoli",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "Mantas nosaukums",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
          },
          {
            name: "start_price",
            description: "Sākuma cena",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: true,
          },
          {
            name: "start_date",
            description: 'Sākuma datums (diena/mēnesis stunda:minūte - "18/11 18:00")',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "end_date",
            description: 'Beigu datums (diena/mēnesis stunda:minūte - "18/11 18:00")',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "amount",
            description: "Mantas daudzums",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
          },
        ],
      },
      {
        name: "delete",
        description: "Izdzēst izsoli",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "id",
            description: "Izsoles id",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "list",
        description: "Saraksts ar izsolēm",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "test",
        description: "Tests",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  autocomplete: allItemAutocomplete("⛔"),
  async run(i) {
    const subCommandName = i.options.getSubcommand();
    if (!subCommandName) return intReply(i, errorEmbed);

    switch (subCommandName) {
      case "create":
        izsoleCreate(i);
        break;
      case "delete":
        izsolesDelete(i);
        break;
      case "list":
        izsoleList(i);
        break;
      case "test": {
        const auctionChannel = i.client.channels.cache.get(process.env.AUCTION_CHANNEL);
        if (!auctionChannel?.isTextBased()) break;
        const auction = await findAuctionById("637513a99e464ed7426ec075");
        auctionChannel!.send(izsoleEmbed(auction!));
        intReply(i, ephemeralReply(":)"));
      }
    }
  },
};

export default izsole;
