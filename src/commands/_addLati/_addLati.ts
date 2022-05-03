import Command from '../../interfaces/Command'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums'
import embedTemplate from '../../embeds/embedTemplate'
import userString from '../../embeds/stringFunctions/userString'
import latiString from '../../embeds/stringFunctions/latiString'
import findUser from '../../economy/findUser'
import errorEmbed from '../../embeds/errorEmbed'
import addLati from '../../economy/addLati'

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
        name: 'latu_daudzums',
        description: 'Cik latus pievienot',
        type: ApplicationCommandOptionTypes.INTEGER,
        required: true,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!
    const latiToAdd = i.options.data[1].value as number

    const targetUser = await findUser(i.guildId!, target.id)
    if (!targetUser) {
      await i.reply(errorEmbed)
      return
    }

    await i.reply(embedTemplate({
      i,
      description: `**${userString(target)}** tika pievienots ${latiString(latiToAdd)}\n` +
        `Tagad viņam ir ${latiString(targetUser.lati + latiToAdd)}`,
    }))

    await addLati(i.guildId!, target.id, latiToAdd)
  },
}