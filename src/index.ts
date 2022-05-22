import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import mongo from './utils/mongo';
import commandHandler from './commands/commandHandler';
import setupCronJobs from './utils/setupCronJobs';
import createDiscounts from './items/discounts/createDiscounts';
import autocompleteHandler from './commands/autocompleteHandler';

process.env.TZ = 'Europe/Riga';
dotenv.config();

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.BOT_TOKEN).then(() => console.log('logged in'));

client.on('ready', async () => {
  createDiscounts();
  setupCronJobs();

  await mongo().then(() => {
    console.log('connected to mongo');
  });
});

client.on('interactionCreate', async i => {
  if (i.isCommand()) await commandHandler(i);
  if (i.isAutocomplete()) await autocompleteHandler(i);
});