import { Client, GatewayIntentBits } from 'discord.js';
import validateEnv from './utils/validateEnv';
import mongo from './utils/mongo';
import commandHandler from './commands/commandHandler';
import autocompleteHandler from './commands/autocompleteHandler';
import chalk from 'chalk';
import setBotPresence from './utils/setBotPresence';
import buttonInteractionHandler from './utils/buttonInteractionHandler';
import messageHandler from './utils/messageHandler';
import 'dotenv/config';
import User from './schemas/User';

process.env.TZ = 'Europe/Riga';

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit(1);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', async () => {
  await mongo().then(() => console.log('Connected to MongoDB'));

  // User.watch().on('change', data => {
  //   console.log(data);
  // });

  setBotPresence(client);
  setInterval(() => setBotPresence(client), 3_600_000);

  client.on('messageCreate', messageHandler);

  client.on('interactionCreate', i => {
    if (i.isChatInputCommand()) commandHandler(i);
    else if (i.isAutocomplete()) autocompleteHandler(i);
    else if (i.isButton()) buttonInteractionHandler(i);
  });
});

client.login(process.env.BOT_TOKEN).then(() => {
  console.log(chalk.yellow(client.user!.tag) + ' logged in');
});
