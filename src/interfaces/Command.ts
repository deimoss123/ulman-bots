import {
  ApplicationCommandData,
  CommandInteraction,
} from 'discord.js';

// interfeiss priekš bota komandu objektiem
interface Command {
  // nosaukums priekš /palīdzība
  title: string;

  // apraksts priekš /palīdzība
  description: string;

  // konfigurācija / komandām priekš reģistrēšanas
  config: ApplicationCommandData;

  // komandas galvenais kods
  run: (i: CommandInteraction) => void;
}

export default Command;