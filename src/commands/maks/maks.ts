import Command from '../../interfaces/Command'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import findUser from '../../economy/findUser'
import embedTemplate from '../../embeds/embedTemplate'
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums'
import errorEmbed from '../../embeds/errorEmbed'
import latiString from '../../utils/latiString'

export const maks: Command = {
  title: 'Maks',
  description: 'Apskatīties savu vai kāda lietotāja maku',
  config: {
    name: 'maks',
    description: 'Apskatīties maku',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam vēlies apskatīt maku',
        type: ApplicationCommandOptionTypes.USER,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {
    let targetId = i.user.id

    if (i.options.data[0]?.user) {
      targetId = i.options.data[0].user.id
    }

    const user = await findUser(i.guildId!, targetId)
    if (!user) {
      await i.reply(errorEmbed)
      return
    }

    let targetText = 'Tev'
    if (targetId === process.env.BOT_ID) targetText = 'Valsts bankai'
    else if (targetId !== i.user.id) targetText = `**${i.user.username}#${i.user.discriminator}**`

    await i.reply(embedTemplate({
      i,
      description: `${targetText} ir ${latiString(user.lati)}`,
    }))
  },
}