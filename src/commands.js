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
    
    // depois você conecta com Supabase aqui
  })

  // ⏱ TEMPO DE USUÁRIO
  bot.command('tempo', async (ctx) => {
    const args = ctx.message.text.split(' ')

    if (!args[1]) {
      return ctx.reply("❌ Use: /tempo @usuario")
    }

    const username = args[1]

    ctx.reply(`⏱ Buscando tempo de ${username}...`)
    
    // depois conecta no banco
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