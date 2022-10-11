import { AutocompleteInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';

// interfeiss priekš bota komandu objektiem
interface Command {
  // apraksts priekš /palīdzība
  description: string;

  // krāsa embediem
  color: number;

  // milisekundes
  cooldown?: number;

  // konfigurācija / komandām priekš reģistrēšanas
  data: ChatInputApplicationCommandData;

  // funkcija priekš / komandu autocomplete apstrādāšanas
  autocomplete?: (i: AutocompleteInteraction) => void;

  // komandas galvenais kods
  run: (i: ChatInputCommandInteraction) => void;
}

export default Command;
