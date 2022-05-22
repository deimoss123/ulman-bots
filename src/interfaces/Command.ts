import {
  ApplicationCommandData, AutocompleteInteraction,
  CommandInteraction,
} from 'discord.js';

// interfeiss priekš bota komandu objektiem
interface Command {
  // nosaukums priekš /palīdzība
  title: string;

  // apraksts priekš /palīdzība
  description: string;

  // krāsa embediem
  color: string;

  // konfigurācija / komandām priekš reģistrēšanas
  config: ApplicationCommandData;

  // funkcija priekš / komandu autocomplete apstrādāšanas
  autocomplete?: (i: AutocompleteInteraction) => void;

  // komandas galvenais kods
  run: (i: CommandInteraction) => void;
}

export default Command;