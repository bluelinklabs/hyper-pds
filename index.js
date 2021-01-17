import express from 'express'
import { Server as WebSocketServer } from 'rpc-websockets'
import * as db from './db/index.js'
import * as api from './api/index.js'
import * as path from 'path'
import * as os from 'os'
import * as schemas from './lib/schemas.js'
import { setOrigin } from './lib/strings.js'

let app

export async function start ({debugMode, port, configDir}) {
  configDir = configDir || path.join(os.homedir(), '.ctzn')
  if (debugMode) {
    schemas.setDebugEndpoint(port)
  }
  setOrigin(`http://localhost:${port}`)

  app = express()
  app.set('view engine', 'ejs')

  app.get('/', (req, res) => {
    res.render('index')
  })

  app.use('/img', express.static('static/img'))
  app.use('/css', express.static('static/css'))
  app.use('/js', express.static('static/js'))
  app.use('/vendor', express.static('static/vendor'))
  app.use('/_schemas', express.static('schemas'))

  app.get('/notifications', (req, res) => {
    res.render('notifications')
  })

  app.get('/profile', (req, res) => {
    res.render('user')
  })

  app.get('/search', (req, res) => {
    res.render('search')
  })

  app.get('/:username([^\/]{3,})', (req, res) => {
    res.render('user')
  })

  app.use((req, res) => {
    res.status(404).send('404 Page not found')
  })

  const server = await new Promise(r => {
    let s = app.listen(port, async () => {
      console.log(`Example app listening at http://localhost:${port}`)

      await db.setup({configDir})
      r(s)
    })
  })

  const wsServer = new WebSocketServer({server})
  api.setup(wsServer)

  // DEBUG always authed as me for now -prf
  wsServer.on('connection', client => {
    client.auth = {username: 'pfrazee'}
  })

  // process.on('SIGINT', close)
  // process.on('SIGTERM', close)
  // async function close () {
  //   console.log('Shutting down, this may take a moment...')
  //   await db.cleanup()
  //   server.close()
  // }

  return {
    server,
    db,
    close: async () => {
      console.log('Shutting down, this may take a moment...')
      await db.cleanup()
      server.close()
    }
  }
}