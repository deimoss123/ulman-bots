import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionUpdateOptions,
  Message,
  MessagePayload,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  SelectMenuInteraction,
} from 'discord.js';
import interactionCache, { InteractionInCache } from '../utils/interactionCache';
import intReply from '../utils/intReply';
import errorEmbed from './errorEmbed';

export interface CallbackReturn {
  edit?: InteractionUpdateOptions | MessagePayload;
  end?: boolean;
  after?: () => any;
  setInactive?: boolean;
  doNothing?: boolean;
  error?: boolean;
}

export default async function buttonHandler(
  interaction: ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction,
  interactionName: string,
  interactionMsg: Message,
  callback: (buttonInteraction: ButtonInteraction | SelectMenuInteraction) => Promise<CallbackReturn | void>,
  time = 30000,
  isActive = false,
  refetchMessage = false
): Promise<void> {
  const collector = interactionMsg.createMessageComponentCollector<ComponentType.Button | ComponentType.StringSelect>({
    time,
  });
  let currentMessage = interactionMsg;
  const userId = interaction.user.id;
  const cacheId = `${userId}-${interaction.guildId!}`;

  // pārbauda vai lietotājs ir interactionCache objektā, ja nav tad tiek pievienots kā {}
  if (!interactionCache.get(cacheId)) {
    interactionCache.set(cacheId, new Map<string, InteractionInCache>());
  }

  // ja interaction ar eksistējošu nosaukumu eksistē tad tā tiek apstādināta
  if (interactionCache.get(cacheId)?.get(interactionName)) {
    interactionCache.get(cacheId)?.get(interactionName)?.collector.stop();
  }

  // pievieno interactionCache objektam pašreizējo interaction
  interactionCache.get(cacheId)!.set(interactionName, {
    collector,
    isInteractionActive: isActive,
  });

  collector.on('collect', async componentInteraction => {
    if (componentInteraction.user.id !== interaction.user.id) {
      intReply(componentInteraction, {
        content: 'Nav pieklājīgi spaidīt svešu cilvēku pogas :^)',
        ephemeral: true,
      });
      return;
    }

    collector.resetTimer();

    const res = await callback(componentInteraction as ButtonInteraction | SelectMenuInteraction);
    if (!res) {
      componentInteraction.deferUpdate().catch(_ => _);
      return;
    }

    if (res?.doNothing) return;

    if (res.error) {
      intReply(componentInteraction, errorEmbed);
      return;
    }

    if (res?.setInactive) {
      const userInteraction = interactionCache.get(cacheId)!.get(interactionName)!;
      interactionCache.get(cacheId)!.set(interactionName, { ...userInteraction, isInteractionActive: false });
    }

    // neliela šizofrēnija
    if (res?.edit) {
      if (res?.after) {
        const editRes = await interaction.editReply(res.edit as MessagePayload).catch(() => null);
        if (editRes) currentMessage = editRes;
      } else {
        const updateRes = await componentInteraction
          .update({
            ...(res.edit as InteractionUpdateOptions),
            fetchReply: true,
          })
          .catch(() => null);
        if (updateRes) currentMessage = updateRes;
      }
    }

    if (res?.end) collector.stop();

    res.after?.();
  });

  collector.on('end', async () => {
    // izdzēš izbeigto interaction no interactionCache
    interactionCache.get(cacheId)?.delete(interactionName);

    if (refetchMessage) {
      currentMessage = await interaction.fetchReply();
    }

    // pārbauda ziņai ir pogas
    if (!currentMessage?.components || !currentMessage.components.length) return;

    let areAllComponentsAlreadyDisabled = true;

    const editedMessageComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

    // iziet cauri visām pogām message objektā un atspējo tās
    currentMessage.components.forEach(row => {
      const editedRow = new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>();
      row.components.forEach(component => {
        if (!component.data.disabled) areAllComponentsAlreadyDisabled = false;

        if (component.type === ComponentType.Button) {
          editedRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
        } else if (component.type === ComponentType.StringSelect) {
          editedRow.addComponents(StringSelectMenuBuilder.from(component).setDisabled(true));
        }
      });
      editedMessageComponents.push(editedRow);
    });

    // rediģē ziņu ar atspējotajām pogām, ja tās jau nav atspējotas
    if (!areAllComponentsAlreadyDisabled) {
      await interaction.editReply({ components: editedMessageComponents }).catch(console.log);
    }
  });
}
