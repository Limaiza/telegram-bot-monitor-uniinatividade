require('dotenv').config()

const { Telegraf } = require('telegraf')

const db = require('./db')
const { handleMessage } = require('./logic')

const registerCommands = require('./commands')

require('./scheduler')

const bot = new Telegraf(
process.env.BOT_TOKEN
)

global.bot = bot

registerCommands(bot)

async function isAdmin(
bot,
userId,
groupId
) {
try {

const member =
  await bot.telegram.getChatMember(
    groupId,
    userId
  )

return (
  member?.status === 'administrator' ||
  member?.status === 'creator'
)

} catch {
return false
}
}

bot.on('text', async (ctx) => {

try {

const user = ctx.from
const text = ctx.message.text

if (ctx.chat.type === 'private') {

  const groups = await db.query(`
    SELECT DISTINCT group_id
    FROM sessions
  `)

  let isAllowed = false

  for (const g of groups.rows) {

    const ok = await isAdmin(
      bot,
      user.id,
      g.group_id
    )

    if (ok) {
      isAllowed = true
      break
    }
  }

  if (!isAllowed) {
    return ctx.reply(
      '❌ Você não é admin de nenhum grupo monitorado.'
    )
  }

  if (text === '/start') {

    return ctx.reply(

`📊 Painel Admin

Comandos:

/usuarios
/metas
/tempo @usuario`
)
}

  if (text === '/usuarios') {

    const result = await db.query(`
      SELECT *
      FROM users
      ORDER BY id DESC
      LIMIT 20
    `)

    const list = result.rows
      .map(
        u =>
          `👤 ${u.username || 'sem @'}`
      )
      .join('\n')

    return ctx.reply(
      `📋 Usuários:\n\n${list}`
    )
  }

  if (text === '/metas') {

    const result = await db.query(`
      SELECT username,
             achieved_at
      FROM achievements
      ORDER BY achieved_at DESC
      LIMIT 20
    `)

    const list = result.rows
      .map(a =>
        `🏆 @${a.username} - ${new Date(
          a.achieved_at
        ).toLocaleString('pt-BR')}`
      )
      .join('\n')

    return ctx.reply(
      `🏆 Metas:\n\n${list}`
    )
  }

  return
}

await handleMessage(
  user.id,
  user.username,
  user.first_name,
  user.last_name,
  ctx.chat.id
)

} catch (err) {

console.error(
  'Erro bot:',
  err
)

}
})

bot.catch((err) => {
console.error(
'Erro Telegraf:',
err
)
})

process.on(
'unhandledRejection',
console.error
)

process.on(
'uncaughtException',
console.error
)

async function start() {

await bot.telegram.deleteWebhook()

await bot.launch()

console.log(
'🤖 Bot iniciado'
)
}

start()