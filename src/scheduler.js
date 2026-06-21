const cron = require('node-cron')
const db = require('./db')

cron.schedule('59 23 * * 5', async () => {

  console.log('♻️ Nova semana')

  await db.query(`
    UPDATE cycles SET active = false WHERE active = true
  `)

  await db.query(`
    INSERT INTO cycles (start_date,end_date,active)
    VALUES (NOW(), NOW() + INTERVAL '7 days', true)
  `)

  await db.query(`
    DELETE FROM sessions
  `)

  await db.query(`
    DELETE FROM achievements
    WHERE achieved_at < NOW() - INTERVAL '14 days'
  `)

})