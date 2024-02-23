import { Client, GatewayIntentBits } from 'discord.js';
import { commandList, devCommandList } from './commands/commandList';
import validateEnv from './utils/validateEnv';
import chalk from 'chalk';
import { getPalidzibaChoices } from './commands/economyCommands/palidziba/palidziba';

async function registerGuildCommands(client: Client) {
  const guild = await client.guilds.fetch(process.env.DEV_SERVER_ID!);

  guild.commands
    .set(
      [...commandList, ...devCommandList].map(command => {
        if (command.data.name === 'palidziba') {
          // @ts-ignore šīzofrēnija
          command.data.options[1].options[0].choices = getPalidzibaChoices();
        }
        return command.data;
      }),
    )
    .then(() => {
      console.log(chalk.green('Guild commands registered!'));
      process.exit(0);
    });
}

if (!validateEnv()) process.exit(1);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.BOT_TOKEN).then(async () => registerGuildCommands(client));
