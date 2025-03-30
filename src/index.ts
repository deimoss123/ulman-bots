import { Client, GatewayIntentBits } from "discord.js";
import validateEnv from "@/utils/validateEnv";
import mongo from "@/utils/mongo";
import autocompleteHandler from "@/utils/autocompleteHandler";
import chalk from "chalk";
import setBotPresence from "@/utils/setBotPresence";
import { loadEmojis } from "@/utils/emoji";
import commandHandler from "@/utils/commandHandler";

process.env.TZ = "Europe/Riga";

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit(1);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const emojiPromise = loadEmojis().then(() => console.log(chalk.yellow("Emojis loaded!")));
const mongoPromise = mongo().then(() => console.log(chalk.yellow("Connected to MongoDB!")));

client.once("ready", async (bot) => {
  await Promise.all([emojiPromise, mongoPromise]);

  console.log(chalk.green("Bot ready!"));

  setBotPresence(bot);
  setInterval(() => setBotPresence(bot), 3_600_000);

  bot.on("interactionCreate", (i) => {
    if (i.isChatInputCommand()) commandHandler(i);
    else if (i.isAutocomplete()) autocompleteHandler(i);
  });
});

client.login(process.env.BOT_TOKEN).then(() => {
  console.log(`${client.user!.tag} logged in!`);
});
