const pool = require('./db')

module.exports = (bot) => {

  bot.command('relatorio', async (ctx) => {
    const res = await pool.query(`
      SELECT u.username, a.achieved_at
      FROM achievements a
      JOIN users u ON u.id = a.user_id
    `)

    let msg = '📊 Relatório:\n\n'

    res.rows.forEach(r => {
      msg += `@${r.username} - ${r.achieved_at}\n`
    })

    await ctx.telegram.sendMessage(ctx.from.id, msg)
  })

}