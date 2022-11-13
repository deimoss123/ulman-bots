import { ButtonInteraction } from 'discord.js';
import handleIzsolesButtons from '../izsoles/handleIzsolesButtons';

export default async function buttonInteractionHandler(i: ButtonInteraction) {
  const { customId } = i;
  if (customId.startsWith('izsole_perm_btn-')) return handleIzsolesButtons(i);
}
