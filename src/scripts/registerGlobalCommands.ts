import { Client, GatewayIntentBits } from 'discord.js';
import { commandList } from '../utils/commandList';
import validateEnv from '../utils/validateEnv';
import chalk from 'chalk';
import { getPalidzibaChoices } from '../commands/palidziba/palidziba';

async function registerGuildCommands(client: Client) {
  client
    .application!.commands.set(
      commandList
        .filter(command => !command.devOnly)
        .map(command => {
          if (command.data.name === 'palidziba') {
            // @ts-ignore šīzofrēnija
            command.data.options[1].options[0].choices = getPalidzibaChoices();
          }
          return command.data;
        }),
    )
    .then(() => {
      console.log(chalk.green('Global commands registered!'));
      process.exit(0);
    });
}

if (!validateEnv()) process.exit(1);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.BOT_TOKEN).then(() => registerGuildCommands(client));
