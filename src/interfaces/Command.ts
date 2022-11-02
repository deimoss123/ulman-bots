import { AutocompleteInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';

// interfeiss bota komandu objektiem
interface Command {
  // palīdzības apraksts
  description: string;

  // krāsa embediem
  color: number;

  // milisekundes
  cooldown?: number;

  // konfigurācija / komandu reģistrēšanai
  data: ChatInputApplicationCommandData;

  // funkcija / komandu autocomplete apstrādāšanai
  autocomplete?: (i: AutocompleteInteraction) => void;

  // komandas galvenais kods
  run: (i: ChatInputCommandInteraction) => void;
}

export default Command;
