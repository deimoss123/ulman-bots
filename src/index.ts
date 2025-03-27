import { Client, GatewayIntentBits } from "discord.js";
import validateEnv from "@/utils/validateEnv";
import mongo from "@/utils/mongo";
import autocompleteHandler from "@/utils/autocompleteHandler";
import chalk from "chalk";
import setBotPresence from "@/utils/setBotPresence";
import buttonInteractionHandler from "@/utils/buttonInteractionHandler";
import messageHandler from "@/utils/messageHandler";
import { loadEmojis } from "@/utils/emoji";
import commandHandler from "@/utils/commandHandler";

process.env.TZ = "Europe/Riga";

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit(1);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

await loadEmojis().then(() => console.log(chalk.green("Emojis loaded")));

const mongoPromise = mongo();

client.once("ready", async (bot) => {
  await mongoPromise.then(() => console.log("Connected to MongoDB"));

  setBotPresence(bot);
  setInterval(() => setBotPresence(bot), 3_600_000);

  bot.on("messageCreate", messageHandler);

  bot.on("interactionCreate", (i) => {
    if (i.isChatInputCommand()) commandHandler(i);
    else if (i.isAutocomplete()) autocompleteHandler(i);
    else if (i.isButton()) buttonInteractionHandler(i);
  });
});

client.login(process.env.BOT_TOKEN).then(() => {
  console.log(chalk.yellow(client.user!.tag) + " logged in");
});
