require('dotenv').config()

const { Telegraf } = require('telegraf')
const { handleMessage } = require('./logic')
const setupCommands = require('./commands')

require('./scheduler')

const bot = new Telegraf(process.env.BOT_TOKEN)

global.bot = bot

setupCommands(bot)

bot.on('text', async (ctx) => {

  if (ctx.chat.type === 'private') return

  const user = ctx.from

  await handleMessage(
    user.id,
    user.username,
    ctx.chat.id
  )
})

bot.launch()

console.log('🤖 Bot rodando')