
'use strict'

const express = require('express')
const proxy = require('express-http-proxy')
const bodyParser = require('body-parser')
const _ = require('lodash')
const config = require('./config')
const commands = require('./commands')
const helpCommand = require('./commands/help')
const throwCommand = require('./commands/throw')

let bot = require('./bot')

let app = express()

if (config('PROXY_URI')) {
  app.use(proxy(config('PROXY_URI'), {
    forwardPath: (req, res) => { return require('url').parse(req.url).path }
  }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => { res.send('\n 👋 🌍 \n') })

app.post('/commands/throw', (req, res) => {
  let payload = req.body

  if (!payload || payload.token !== config('STARBOT_COMMAND_TOKEN')) {
    let err = '✋  Star—what? An invalid slash token was provided\n' +
              '   Is your Slack slash token correctly configured?'
    console.log(err)
    res.status(401).end(err)
    return
  }

  console.log(payload)

  let cmd = throwCommand;

  cmd.handler(payload, res)
})

app.listen(config('PORT'), (err) => {
  if (err) throw err

  console.log(`\n🚀  Starbot LIVES on PORT ${config('PORT')} 🚀`)

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @starbot is real-time\n`)
    bot.listen({ token: config('SLACK_TOKEN') })
  }
})
