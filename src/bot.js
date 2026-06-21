require('dotenv').config()

const { Telegraf } = require('telegraf')
const db = require('./db')
const { handleMessage } = require('./logic')

const bot = new Telegraf(process.env.BOT_TOKEN)

global.bot = bot

// 🔥 MUITO IMPORTANTE (resolve PV que não responde)
bot.telegram.deleteWebhook()

// ======================
// 🔐 CHECK ADMIN
// ======================
async function isAdmin(bot, userId, groupId) {
  try {
    const member = await bot.telegram.getChatMember(groupId, userId)

    return (
      member.status === 'administrator' ||
      member.status === 'creator'
    )
  } catch (err) {
    return false
  }
}

// ======================
// 🤖 HANDLER ÚNICO
// ======================
bot.on('text', async (ctx) => {

  const user = ctx.from
  const text = ctx.message.text

  // ======================
  // 💬 PV = PAINEL ADMIN
  // ======================
  if (ctx.chat.type === 'private') {

    console.log('📩 PV:', text)

    const groups = await db.query(`
      SELECT DISTINCT group_id FROM sessions
    `)

    let isAllowed = false

    for (const g of groups.rows) {

      const ok = await isAdmin(bot, user.id, g.group_id)

      if (ok) {
        isAllowed = true
        break
      }
    }

    if (!isAllowed) {
      return ctx.reply('❌ Você não é admin de nenhum grupo monitorado.')
    }

    if (text === '/start') {
      return ctx.reply('📊 Painel admin ativo\n\nComandos:\n/usuarios\n/metas\n/tempo @user')
    }

    if (text === '/usuarios') {

      const result = await db.query(`
        SELECT * FROM users
        ORDER BY id DESC
        LIMIT 20
      `)

      const list = result.rows
        .map(u => `👤 ${u.username || 'sem @'} (${u.first_name || ''})`)
        .join('\n')

      return ctx.reply(`📋 Usuários:\n\n${list}`)
    }

    if (text === '/metas') {

      const result = await db.query(`
        SELECT username, achieved_at
        FROM achievements
        ORDER BY achieved_at DESC
        LIMIT 20
      `)

      const list = result.rows
        .map(a =>
          `🏆 @${a.username} - ${new Date(a.achieved_at).toLocaleString('pt-BR')}`
        )
        .join('\n')

      return ctx.reply(`🏆 Metas:\n\n${list}`)
    }

    if (text.startsWith('/tempo')) {

      const username = text.split(' ')[1]?.replace('@','')

      if (!username) {
        return ctx.reply('Use: /tempo @usuario')
      }

      const result = await db.query(`
        SELECT * FROM achievements
        WHERE username = $1
        ORDER BY achieved_at DESC
        LIMIT 1
      `, [username])

      if (!result.rows.length) {
        return ctx.reply('❌ Usuário ainda não bateu meta')
      }

      const d = new Date(result.rows[0].achieved_at)

      return ctx.reply(
`👤 @${username}
🏆 Meta batida:
📅 ${d.toLocaleDateString('pt-BR')}
⏰ ${d.toLocaleTimeString('pt-BR')}`
      )
    }

    return ctx.reply('📌 Comandos:\n/start\n/usuarios\n/metas\n/tempo @user')
  }

  // ======================
  // 👥 GRUPO (TEMPO)
  // ======================
  await handleMessage(
    user.id,
    user.username,
    user.first_name,
    user.last_name,
    ctx.chat.id
  )
})

// ======================
// 🚀 START BOT
// ======================
bot.launch()

console.log('🤖 Bot rodando')