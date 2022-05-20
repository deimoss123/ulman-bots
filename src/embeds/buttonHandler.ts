import {
  ButtonInteraction,
  CommandInteraction,
  InteractionUpdateOptions,
  Message, MessagePayload, SelectMenuInteraction,
} from 'discord.js';

interface CallbackReturn {
  edit?: InteractionUpdateOptions | MessagePayload,
  end?: boolean
  after?: () => Promise<void>
}

export default async function buttonHandler(
  cmdInteraction: CommandInteraction | ButtonInteraction,
  interactionMsg: Message,
  callback: (buttonInteraction: ButtonInteraction | SelectMenuInteraction) => Promise<CallbackReturn | undefined>,
  time: number = 15000,
): Promise<void> {
  const collector = interactionMsg.createMessageComponentCollector({ time });
  let currentMessage = interactionMsg;

  collector.on('collect', async componentInteraction => {
    if (componentInteraction.user.id !== cmdInteraction.user.id) {
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

    if (res?.edit) {
      if (res?.after) {
        currentMessage = await cmdInteraction.editReply(res.edit as MessagePayload) as Message;
      } else currentMessage = await componentInteraction.update(
        { ...res.edit as InteractionUpdateOptions, fetchReply: true },
      ) as Message;
    }

    if (res?.end) {
      collector.stop();
    }

    await res.after?.();
  });

  collector.on('end', async () => {
    if (!currentMessage?.components || !currentMessage.components.length) return;

    let areAllComponentsDisabled = true;

    currentMessage.components.forEach(row => {
      row.components.forEach(component => {
        if (!component.disabled) {
          areAllComponentsDisabled = false;
          component.setDisabled(true);
        }
      });
    });

    if (!areAllComponentsDisabled) {
      await cmdInteraction.editReply({ components: currentMessage.components });
    }
  });
}