const db = require('./db')

module.exports = function setupCommands(bot) {

  // 🟢 START
  bot.start((ctx) => {
    ctx.reply(
      "👋 Olá! Sou o bot de monitoramento.\n\n" +
      "📊 Uso:\n" +
      "/status - ver status\n" +
      "/ranking - ver ranking\n" +
      "/tempo @user - tempo do usuário"
    )
  })

  // 📊 STATUS
  bot.command('status', (ctx) => {
    ctx.reply("📊 Bot está ativo e monitorando o grupo.")
  })

  // 🏆 RANKING
  bot.command('ranking', async (ctx) => {
    ctx.reply("🏆 Buscando ranking da semana...")

    // depois conectar com banco
  })

  // ⏱ TEMPO DE USUÁRIO (CORRIGIDO)
  bot.command('tempo', async (ctx) => {
    const args = ctx.message.text.split(' ')

    if (!args[1]) {
      return ctx.reply("❌ Use: /tempo @usuario")
    }

    const username = args[1].replace('@', '')

    try {
      const result = await db.query(
        'SELECT total_minutes FROM users WHERE username = $1',
        [username]
      )

      if (result.rows.length === 0) {
        return ctx.reply("❌ Usuário não encontrado no banco.")
      }

      const minutes = result.rows[0].total_minutes

      return ctx.reply(
        `⏱ @${username} tem ${minutes} minutos registrados na semana.`
      )

    } catch (err) {
      console.error(err)
      return ctx.reply("❌ Erro ao buscar dados.")
    }
  })

  // 🔄 RESET (ADMIN)
  bot.command('reset', async (ctx) => {
    ctx.reply("♻️ Resetando dados da semana...")

    // lógica futura
  })

  // ⚙ CONFIG
  bot.command('config', (ctx) => {
    ctx.reply(
      "⚙ Configurações:\n" +
      "- limite 4 min entre mensagens\n" +
      "- meta 20 min de conversa"
    )
  })

}