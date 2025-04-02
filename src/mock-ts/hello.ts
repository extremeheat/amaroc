import './world.ts'
import { world } from './world.ts'

export function hello(): string {
  return 'hello ' + world
}

import('./world.ts').then(console.log)