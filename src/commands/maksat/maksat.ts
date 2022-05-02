import Command from '../../interfaces/Command'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums'
import findUser from '../../economy/findUser'
import embedTemplate from '../../embeds/embedTemplate'
import latiString from '../../embeds/latiString'
import errorEmbed from '../../embeds/errorEmbed'
import userString from '../../embeds/userString'
import addLati from '../../economy/addLati'
import ephemeralReply from '../../embeds/ephemeralReply'

export const maksat: Command = {
  title: 'Maksāt',
  description: 'Pārskaitīt citam lietotājam naudu',
  config: {
    name: 'maksāt',
    description: 'Pārskaitīt citam lietotājam naudu',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam maksāt',
        type: ApplicationCommandOptionTypes.USER,
        required: true,
      }, {
        name: 'latu_daudzums',
        description: 'Cik latus vēlies samaksāt',
        type: ApplicationCommandOptionTypes.INTEGER,
        min_value: 1,
        required: true,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {
    const latiToAdd = i.options.data[1].value as number
    const target = i.options.data[0].user!

    if (target.id === i.user.id) {
      await i.reply(ephemeralReply('Tu nevari maksāt sev'))
      return
    }

    if (target.id === process.env.BOT_ID) {
      await i.reply(ephemeralReply('Tu nevari maksāt Valsts bankai'))
      return
    }

    const user = await findUser(i.guildId!, i.user.id)
    if (!user) {
      await i.reply(errorEmbed)
      return
    }

    // nepietiek lati
    if (user.lati < latiToAdd) {
      await i.reply(embedTemplate({
        i,
        description: `Tu nevari maksāt ${latiString(latiToAdd, true)}\n` +
          `Tev ir ${latiString(user.lati)}`,
      }))
      return
    }

    const targetUser = await findUser(i.guildId!, target.id)
    if (!targetUser) {
      await i.reply(errorEmbed)
      return
    }

    await i.reply(embedTemplate({
      i,
      content: `<@${target.id}>`,
      description: `Tu samaksāji ${userString(target, true)} ${latiString(latiToAdd, true)}`,
      fields: [
        {
          name: 'Tev palika',
          value: latiString(user.lati - latiToAdd),
          inline: true,
        }, {
          name: 'Tagad viņam ir',
          value: latiString(targetUser.lati + latiToAdd),
          inline: true,
        },
      ],
    }))

    await addLati(i.guildId!, i.user.id, -latiToAdd)
    await addLati(i.guildId!, target.id, latiToAdd)
  },
}