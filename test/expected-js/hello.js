import "./world.js"
import { world } from "./world.js"

export function hello()         {
  return 'hello ' + world
}

import("./world.js").then(console.log)