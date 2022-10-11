import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import ruleteData, { RulPosition } from './ruleteData';
import ruleteRun from './ruleteRun';

export type RuleteLikme = 'viss' | 'virve' | number;

const rulete: Command = {
  description: 'rulete', // TODO
  color: commandColors.rulete,
  data: ruleteData,
  async run(i) {
    const subCommandGroup = i.options.getSubcommandGroup()!;
    const position: RulPosition | number =
      subCommandGroup === 'pozīcija'
        ? (i.options.getString('pozīcija') as RulPosition)
        : i.options.getInteger('skaitlis')!;

    const subCommand = i.options.getSubcommand()!;
    const likme: RuleteLikme =
      subCommand === 'likme' ? i.options.getInteger('likme_lati')! : (subCommand as 'viss' | 'virve');

    ruleteRun(i, position, likme);
  },
};

export default rulete;
