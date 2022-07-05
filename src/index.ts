import { Client, Intents } from 'discord.js';
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

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
  createDiscounts();
  setupCronJobs();
  mongo().then(() => console.log('Connected to MongoDB'));
});

client.on('interactionCreate', async (i) => {
  if (i.isCommand()) await commandHandler(i);
  if (i.isAutocomplete()) await autocompleteHandler(i);
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log(chalk.yellow(client.user!.tag) + ' logged in'));
