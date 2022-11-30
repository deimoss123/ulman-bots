import { ButtonInteraction } from 'discord.js';
import handleAdventeButton from '../advente/handleAdventeButton';
import handleIzsolesButtons from '../izsoles/handleIzsolesButtons';

export default async function buttonInteractionHandler(i: ButtonInteraction) {
  const { customId } = i;

  if (customId.startsWith('izsole_perm_btn-')) return handleIzsolesButtons(i);
  else if (customId.startsWith('advente_claim_btn')) return handleAdventeButton(i);
}
