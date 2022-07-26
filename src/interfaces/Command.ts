import {
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';

// interfeiss priekš bota komandu objektiem
interface Command {
  // nosaukums priekš /palīdzība
  title: string;

  // apraksts priekš /palīdzība
  description: string;

  // krāsa embediem
  color: number;

  // konfigurācija / komandām priekš reģistrēšanas
  data: ChatInputApplicationCommandData;

  // funkcija priekš / komandu autocomplete apstrādāšanas
  autocomplete?: (i: AutocompleteInteraction) => void;

  // komandas galvenais kods
  run: (i: ChatInputCommandInteraction) => void;
}

export default Command;
