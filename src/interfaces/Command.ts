import { Message } from 'discord.js'

// interfeiss priekš bota komandu objektiem
export interface Command {
  // nosaukums
  title: string

  // apraksts
  description: string

  // vai komanda ir domāta priekš bota izstrādātāja (komandas priekš testēšanas)
  devCommand: boolean

  // komandu alternatīvi piemēram ".zvejot", ".copēt", ".zveja" utt.
  aliases: string[]

  // komandas galvenais kods
  run: (msg: Message, args: string[]) => void
}