import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import mongo from './economy/mongo';
import commandHandler from './commands/commandHandler';
import setupCronJobs from './utils/setupCronJobs';
import createDiscounts from './items/discounts/createDiscounts';

dotenv.config();

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit();

// izveidota bota instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.BOT_TOKEN).then(() => console.log('logged in'));

client.on('ready', async () => {
  createDiscounts();
  setupCronJobs();

  await mongo().then(() => {
    console.log('connected to mongo');
  });
});

// bots gaida komandas
client.on('interactionCreate', async i => {
  if (i.isCommand()) {
    await commandHandler(i);
  }
});