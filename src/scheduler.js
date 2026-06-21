const cron = require('node-cron')
const pool = require('./db')

cron.schedule('1 0 * * *', async () => {
  console.log('Relatório diário rodando...')
})

cron.schedule('59 23 * * 5', async () => {
  await pool.query(`DELETE FROM sessions`)
  await pool.query(`DELETE FROM achievements`)
  console.log('Reset semanal')
})