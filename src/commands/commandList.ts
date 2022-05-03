import Command from '../interfaces/Command'
import { ping } from './ping/ping'
import { maks } from './maks/maks'
import { _addLati } from './_addLati/_addLati'
import { maksat } from './maksat/maksat'
import { _addItem } from './_addItem/_addItem'
import inventars from './inventars/inventars'

// komandu objektu saraksts
export const commandList: Command[] = [
  ping, maks, maksat, inventars,
]

export const devCommandList: Command[] = [
  _addLati, _addItem,
]