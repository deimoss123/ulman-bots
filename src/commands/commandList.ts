import Command from '../interfaces/Command'
import { ping } from './ping/ping'
import { maks } from './maks/maks'

// komandu objektu saraksts
export const commandList: Command[] = [
  ping, maks
]