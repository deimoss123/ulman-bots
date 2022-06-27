import {
  ButtonInteraction,
  CommandInteraction,
  InteractionUpdateOptions,
  Message,
  MessagePayload,
  SelectMenuInteraction,
} from 'discord.js';
import interactionCache from '../utils/interactionCache';

interface CallbackReturn {
  edit?: InteractionUpdateOptions | MessagePayload;
  end?: boolean;
  after?: () => Promise<void>;
  setInactive?: boolean;
}

export default async function buttonHandler(
  interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
  interactionName: string,
  interactionMsg: Message,
  callback: (
    buttonInteraction: ButtonInteraction | SelectMenuInteraction
  ) => Promise<CallbackReturn | undefined>,
  time = 15000,
  isActive = false
): Promise<void> {
  const collector = interactionMsg.createMessageComponentCollector({ time });
  let currentMessage = interactionMsg;

  // pārbauda vai lietotājs ir interactionCache objektā, ja nav tad tiek pievienots kā {}
  if (!interactionCache?.[interaction.user.id]) {
    interactionCache[interaction.user.id] = {};
  }

  // ja interaction ar eksistējošu nosaukumu eksistē tad tā tiek apstādināta
  if (interactionCache?.[interaction.user.id]?.[interactionName]) {
    interactionCache[interaction.user.id][interactionName].collector.stop();
  }

  // pievieno interactionCache objektam pašreizējo interaction
  interactionCache[interaction.user.id][interactionName] = {
    collector,
    isInteractionActive: isActive,
  };

  collector.on('collect', async (componentInteraction) => {
    if (componentInteraction.user.id !== interaction.user.id) {
      await componentInteraction.reply({
        content: 'Šī poga nav domāta tev',
        ephemeral: true,
      });
      return;
    }

    const res = await callback(componentInteraction as ButtonInteraction | SelectMenuInteraction);
    if (!res) {
      await componentInteraction.deferUpdate();
      return;
    }

    if (res?.setInactive) {
      interactionCache[interaction.user.id][interactionName].isInteractionActive = false;
    }

    // neliela šizofrēnija
    if (res?.edit) {
      if (res?.after) {
        currentMessage = (await interaction.editReply(res.edit as MessagePayload)) as Message;
      } else {
        currentMessage = (await componentInteraction.update({
          ...(res.edit as InteractionUpdateOptions),
          fetchReply: true,
        })) as Message;
      }
    }

    if (res?.end) {
      collector.stop();
    }

    await res.after?.();
  });

  collector.on('end', async () => {
    // izdzēš izbeigto interaction no interactionCache
    delete interactionCache[interaction.user.id][interactionName];

    // pārbauda ziņai ir pogas
    if (!currentMessage?.components || !currentMessage.components.length) return;

    let areAllComponentsDisabled = true;

    // iziet cauri visām pogām message objektā un atspējo tās
    currentMessage.components.forEach((row) => {
      row.components.forEach((component) => {
        if (!component.disabled) {
          areAllComponentsDisabled = false;
          component.setDisabled(true);
        }
      });
    });

    // rediģē ziņu ar atspējotajām pogām, ja tās jau nav atspējotas
    if (!areAllComponentsDisabled) {
      try {
        await interaction.editReply({ components: currentMessage.components });
      } catch (e) {}
    }
  });
}
