import Command from '../../interfaces/Command'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums'

export const _addLati: Command = {
  title: 'AddLati',
  description: 'Pievienot latus',
  config: {
    name: 'addlati',
    description: 'Pievienot latus',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam pievienot latus',
        type: ApplicationCommandOptionTypes.USER,
        required: true,
      }, {
        name: 'latu daudzums',
        description: 'Cik latus pievienot',
        type: ApplicationCommandOptionTypes.NUMBER,
        required: true,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {

  },
}