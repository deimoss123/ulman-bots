import Command from '../interfaces/Command'
import { ping } from './ping/ping'
import { maks } from './maks/maks'
import { _addLati } from './_addLati/_addLati'
import { maksat } from './maksat/maksat'

// komandu objektu saraksts
export const commandList: Command[] = [
  ping, maks, maksat,
]

export const devCommandList: Command[] = [
  _addLati,
]