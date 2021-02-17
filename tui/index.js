import * as path from 'path'
import * as os from 'os'
import blessed from 'blessed'
import * as views from './views/index.js'
 
export function start ({pkg, configDir}) {
  configDir = configDir || path.join(os.homedir(), '.ctzn')
  
  var screen = blessed.screen({
    smartCSR: true,
    dockBorders: true
    // log: './tui.log'
  })
  screen.title = `CTZN ${pkg.version}`
  screen.key(['C-c'], function(ch, key) {
    return process.exit(0)
  })
  screen.key(['f1'], () => views.goto('home'))
  screen.key(['f2'], () => views.goto('hyperspace'))

  views.setup({screen}, {pkg, configDir})
  views.goto('home')
}
