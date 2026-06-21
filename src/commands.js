const db = require('./db')

module.exports = function (bot) {
    bot.command('pingdb', async (ctx) => {
    try {
      await db.query('SELECT NOW()')
      return ctx.reply('✅ Supabase conectado')
    } catch (err) {
      console.error(err)
      return ctx.reply('❌ Erro no banco')
    }
  })
    bot.command('setgrupo', async (ctx) => {
    try {

      const args = ctx.message.text.split(' ')

      if (!args[1]) {
        return ctx.reply('Use: /setgrupo ID_DO_GRUPO')
      }

      await db.query(`
        UPDATE settings
        SET report_group_id = $1
        WHERE id = 1
      `, [args[1]])

      return ctx.reply('✅ Grupo de relatório salvo')

    } catch (err) {
      console.error(err)
      return ctx.reply('❌ Erro ao salvar grupo')
    }
  })
    bot.command('tempo', async (ctx) => {
    try {

      const username = ctx.message.text
        .split(' ')[1]
        ?.replace('@', '')

      if (!username) {
        return ctx.reply('Use: /tempo @usuario')
      }

      const cycle = await db.query(`
        SELECT id
        FROM cycles
        WHERE active = true
        LIMIT 1
      `)

      if (!cycle.rows.length) {
        return ctx.reply('❌ Nenhum ciclo ativo')
      }

      const result = await db.query(`
        SELECT *
        FROM achievements
        WHERE username = $1
        AND cycle_id = $2
        LIMIT 1
      `, [
        username,
        cycle.rows[0].id
      ])

      if (!result.rows.length) {
        return ctx.reply(
          `❌ @${username} ainda não completou 20 min`
        )
      }

      const d = new Date(
        result.rows[0].achieved_at
      )

      return ctx.reply(
`✅ @${username}
📅 ${d.toLocaleDateString('pt-BR')}
⏰ ${d.toLocaleTimeString('pt-BR')}`
      )

    } catch (err) {
      console.error(err)
      return ctx.reply('❌ Erro interno')
    }
  })
    bot.command('historico', async (ctx) => {
    try {

      const username = ctx.message.text
        .split(' ')[1]
        ?.replace('@', '')

      if (!username) {
        return ctx.reply('Use: /historico @usuario')
      }

      const cycle = await db.query(`
        SELECT id
        FROM cycles
        ORDER BY id DESC
        OFFSET 1
        LIMIT 1
      `)

      if (!cycle.rows.length) {
        return ctx.reply('❌ Não existe ciclo anterior')
      }

      const result = await db.query(`
        SELECT *
        FROM achievements
        WHERE username = $1
        AND cycle_id = $2
        LIMIT 1
      `, [
        username,
        cycle.rows[0].id
      ])

      if (!result.rows.length) {
        return ctx.reply(
          '❌ Sem registro na semana passada'
        )
      }

      const d = new Date(
        result.rows[0].achieved_at
      )

      return ctx.reply(
`📚 Semana passada
👤 @${username}
📅 ${d.toLocaleDateString('pt-BR')}
⏰ ${d.toLocaleTimeString('pt-BR')}`
      )

    } catch (err) {
      console.error(err)
      return ctx.reply('❌ Erro interno')
    }
  })
  }