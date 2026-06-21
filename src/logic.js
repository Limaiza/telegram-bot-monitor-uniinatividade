const db = require('./db')
const { getActiveCycle } = require('./cycle')

const MAX_INTERVAL = 4 * 60 * 1000
const TARGET_TIME = 20 * 60 * 1000

async function handleMessage(userId, username, groupId) {

  if (!username) return

  const now = new Date()

  // salva usuário
  await db.query(`
    INSERT INTO users (telegram_id, username)
    VALUES ($1,$2)
    ON CONFLICT (telegram_id)
    DO UPDATE SET username = $2
  `, [userId, username])

  const userRes = await db.query(`
    SELECT * FROM users WHERE telegram_id = $1
  `, [userId])

  const user = userRes.rows[0]

  const cycle = await getActiveCycle()

  // já completou nessa semana?
  const check = await db.query(`
    SELECT * FROM achievements
    WHERE user_id = $1 AND cycle_id = $2
  `, [user.id, cycle.id])

  if (check.rows.length) return

  // sessão ativa?
  const sessionRes = await db.query(`
    SELECT * FROM sessions
    WHERE user_id = $1 AND active = true
  `, [user.id])

  const nowDate = new Date()

  if (sessionRes.rows.length === 0) {
    await db.query(`
      INSERT INTO sessions
      (user_id, group_id, start_time, last_message_time)
      VALUES ($1,$2,$3,$3)
    `, [user.id, groupId, nowDate])
    return
  }

  const session = sessionRes.rows[0]

  const diff = nowDate - new Date(session.last_message_time)

  if (diff > MAX_INTERVAL) {
    await db.query(`
      UPDATE sessions
      SET start_time = $1, last_message_time = $1
      WHERE id = $2
    `, [nowDate, session.id])
    return
  }

  await db.query(`
    UPDATE sessions
    SET last_message_time = $1
    WHERE id = $2
  `, [nowDate, session.id])

  const duration = nowDate - new Date(session.start_time)

  if (duration >= TARGET_TIME) {

    await db.query(`
      INSERT INTO achievements
      (user_id, username, achieved_at, cycle_id)
      VALUES ($1,$2,$3,$4)
    `, [user.id, username, nowDate, cycle.id])

    await db.query(`
      UPDATE sessions SET active = false WHERE id = $1
    `, [session.id])

    console.log(`🏆 ${username} bateu 20 min`)
  }
}

module.exports = { handleMessage }