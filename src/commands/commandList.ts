import Command from '../interfaces/Command'
import { ping } from './ping/ping'
import { maks } from './maks/maks'
import { _addLati } from './_addLati/_addLati'

// komandu objektu saraksts
export const commandList: Command[] = [
  ping, maks,
]

export const devCommandList: Command[] = [
  _addLati,
]