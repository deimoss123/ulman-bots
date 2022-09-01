import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  InteractionType,
} from 'discord.js';
import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import mongo from './utils/mongo';
import commandHandler from './commands/commandHandler';
import setupCronJobs from './utils/setupCronJobs';
import createDiscounts from './items/discounts/createDiscounts';
import autocompleteHandler from './commands/autocompleteHandler';
import chalk from 'chalk';

process.env.TZ = 'Europe/Riga';
dotenv.config();

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit(1);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  createDiscounts();
  setupCronJobs();
  mongo().then(() => console.log('Connected to MongoDB'));
});

client.on('interactionCreate', async i => {
  if (i.type === InteractionType.ApplicationCommand) {
    await commandHandler(i as ChatInputCommandInteraction);
  } else if (i.type === InteractionType.ApplicationCommandAutocomplete) {
    await autocompleteHandler(i);
  }
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log(chalk.yellow(client.user!.tag) + ' logged in'));
