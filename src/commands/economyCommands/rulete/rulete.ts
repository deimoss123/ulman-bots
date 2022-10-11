import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import ruleteData, { RulPosition } from './ruleteData';
import ruleteRun from './ruleteRun';

export type KazinoLikme = 'viss' | 'virve' | number;

const rulete: Command = {
  description:
    'Otrs iecienītākais veids kā iztērēt visu savu naudu\n\n' +
    'Ja ruletes komandai izvēlēsies `pozīcija`, tad tev būs jāizvēlas viena no pozīcijām uz kā likt likmi, pozīcijām reizinātājs ir **2x**\n' +
    'Ja izvēlēsies `skaitlis`, tad tev būs jāizvēlās skaitlis no **0** līdz **36** uz kā likt likmi, skaitļiem reizinātājs ir **35x**\n\n' +
    'Ruletei, tāpat kā feniksam ir 3 iespējamie likmju veidi:\n' +
    '- **virve** (griezt nejauši izvēlētu naudas summu)\n' +
    '- **viss** (griezt visu savu naudu)\n' +
    '- **likme** (griezt sevis izvēlētu likmi)\n\n' +
    '_UlmaņBota veidotājs nav atbildīgs par jebkāda veida azarspēļu atkarības izraisīšanu, ' +
    'kā arī neatbalsta azartspēļu spēlēšanu ar īstu naudu_\n\n' +
    '**Griez atbildīgi!**',
  color: commandColors.rulete,
  data: ruleteData,
  async run(i) {
    const subCommandGroup = i.options.getSubcommandGroup()!;
    const position: RulPosition | number =
      subCommandGroup === 'pozīcija'
        ? (i.options.getString('pozīcija') as RulPosition)
        : i.options.getInteger('skaitlis')!;

    const subCommand = i.options.getSubcommand()!;
    const likme: KazinoLikme =
      subCommand === 'likme' ? i.options.getInteger('likme_lati')! : (subCommand as 'viss' | 'virve');

    ruleteRun(i, position, likme);
  },
};

export default rulete;
