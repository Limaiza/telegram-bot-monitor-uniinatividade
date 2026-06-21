require('dotenv').config()
const { Telegraf } = require('telegraf')
const { handleMessage } = require('./logic')
const setupCommands = require('./commands')
require('./scheduler')

const bot = new Telegraf(process.env.BOT_TOKEN)

setupCommands(bot)

bot.on('text', async (ctx) => {
  if (ctx.chat.type === 'private') return

  await handleMessage(
    ctx.from.id,
    ctx.from.username,
    ctx.chat.id
  )
})

bot.launch()

console.log('Bot rodando...')