import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionReplyOptions,
  Message,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import intReply from './intReply';
import chalk from 'chalk';
import errorEmbed from '../embeds/errorEmbed';
import interactionCache, { InteractionInCache } from './interactionCache';

// apvienots tips visiem iespējamiem interactioniem, kam var izmantot šo klasi
type InteractionType =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction;

// objekts, ko atgriež onClick handleris
type OnClickCallbackReturn = {
  // atbildēt ar kļūdas paziņojumu
  error?: true;

  // tiks palaista update metode
  // šim ir prioritāte virs edit, bet abus nav jēga likt objektā,
  // jo abi dara vienu un to pašu - rediģē ziņu, tikai update to dara atbildot uz interaction
  update?: true;

  // tiks palaista edit metode
  edit?: true;

  // pārtrauks šī dialoga collectori un atspējos visas pogas
  end?: true;

  // funkcija, kas tiks palaista pēc beigām
  // piemēram, feniksam spiežot "griezt vēlreiz" tiek palaista feniksa komanda vēlreiz
  after?: () => any;
};

// jaunā klase interactioniem/pogām/embediem, kas aizvieto drausmīgo buttonHandler
// plāns ir izveidot kaut ko līdzīgu elm arhitektūrai
// šo nākotnē vajadzētu integrēt visur
export class Dialogs<T extends { [key: string]: any }> {
  private userId: string;
  private guildId: string;

  private primaryMsg: Message | null = null;

  private isActive: boolean = false;
  private collectorTime: number = 15000;

  constructor(
    // sākotnējais interaction, piemēram, no komandas
    private primaryInteraction: InteractionType,

    // viss dialoga "state", šis ir jāmaina pa tiešo, bet setteriem
    public state: T,

    // funkcija, kas atgriež embedus/pogas, atkarīga no state
    private viewFunc: (state: T, interaction: InteractionType) => InteractionReplyOptions & { fetchReply: true },

    private name: string,

    options?: { isActive?: boolean; time?: number },
  ) {
    this.userId = primaryInteraction.user.id;
    this.guildId = primaryInteraction.guildId!;

    if (options) {
      if ('isActive' in options) this.isActive = options.isActive!;
      if ('time' in options) this.collectorTime = options.time!;
    }
  }

  public setActive(active: boolean) {
    const obj = interactionCache.get(`${this.userId}-${this.guildId}`)!.get(this.name)!;
    interactionCache.get(`${this.userId}-${this.guildId}`)?.set(this.name, { ...obj, isInteractionActive: active });

    this.isActive = active;
  }

  // funkcija, kas pirmo reizi atbild uz interaction
  // atgriež statusu -> true = izdevās atbildēt, false = neizdevās
  public async start(): Promise<boolean> {
    const res = await intReply(this.primaryInteraction, this.viewFunc(this.state, this.primaryInteraction));
    if (!res) return false;

    this.primaryMsg = res;
    return true;
  }

  // atbildēt uz interaction ar "update"
  public async update(interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<boolean> {
    try {
      // @ts-ignore TS bļauj, jo ir neliela putra ar discord.js tipiem, nāksies ignorēt
      await interaction.update(this.viewFunc(this.state, this.primaryInteraction));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // rediģē ziņu
  public async edit(): Promise<boolean> {
    try {
      await this.primaryInteraction.editReply(this.viewFunc(this.state, this.primaryInteraction));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // izveidot interaction collector uz ziņas un izsauc callbacku uz klikšķi
  // šo funkciju izsaukt tikai VIENREIZ uz katra objekta, citādāk būs ziepes
  // ja nebūs palaista start() metode, šis neko nedarīs
  public onClick(
    callback: (
      componentInteraction: ButtonInteraction | StringSelectMenuInteraction,
    ) => Promise<OnClickCallbackReturn | void>,
  ) {
    if (!this.primaryMsg) {
      console.log(chalk.red('Kļūda: ') + 'Tu neesi palaidis start() metodi dialogam');
      return;
    }

    if (!this.name) {
      console.log(chalk.red('Kļūda: ') + 'Dialoga nosaukums (name) nevar būt tukšs');
      return;
    }

    const cacheId = `${this.userId}-${this.guildId}`;

    const collector = this.primaryMsg?.createMessageComponentCollector<
      ComponentType.Button | ComponentType.StringSelect
    >({
      time: this.collectorTime,
    });

    // pārbauda vai lietotājs ir interactionCache objektā, ja nav tad tiek pievienots kā {}
    if (!interactionCache.get(cacheId)) {
      interactionCache.set(cacheId, new Map<string, InteractionInCache>());
    }

    // ja interaction ar eksistējošu nosaukumu eksistē tad tā tiek apstādināta
    if (interactionCache.get(cacheId)?.get(this.name)) {
      interactionCache.get(cacheId)?.get(this.name)?.collector.stop();
    }

    // pievieno interactionCache objektam pašreizējo interaction
    interactionCache.get(cacheId)!.set(this.name, {
      collector,
      isInteractionActive: this.isActive,
    });

    collector?.on('collect', async componentInteraction => {
      // pārbauda vai pogu spieda autors
      if (componentInteraction.user.id !== this.primaryInteraction.user.id) {
        intReply(componentInteraction, {
          content: 'Nav pieklājīgi spaidīt svešu cilvēku pogas :^)',
          ephemeral: true,
        });
        return;
      }

      collector.resetTimer();

      const res = await callback(componentInteraction);
      if (!res) {
        if (componentInteraction.replied) return;
        await componentInteraction.deferUpdate().catch(_ => _);
        return;
      }

      if (res.error) {
        await intReply(componentInteraction, errorEmbed);
        return;
      }

      if (res.update) {
        this.update(componentInteraction);
      }

      if (res.edit && !res.update) {
        this.edit();
      }

      if (res.end) {
        collector.stop();
      }

      if (res.after) {
        res.after();
      }
    });

    collector?.on('end', async () => {
      let currentMessage: Message;

      try {
        currentMessage = await this.primaryInteraction.fetchReply();
      } catch (e) {
        console.log(e);
        return;
      }

      // atiestata componentus

      // pārbauda ziņai ir pogas
      if (!currentMessage?.components || !currentMessage.components.length) return;

      let areAllComponentsAlreadyDisabled = true;

      const editedMessageComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

      // iziet cauri visām pogām/izvēlnēm message objektā un atspējo tās
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
        await this.primaryInteraction.editReply({ components: editedMessageComponents }).catch(console.log);
      }
    });
  }
}
