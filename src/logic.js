const pool = require('./db')
const dayjs = require('dayjs')

const MAX_INTERVAL = 4 * 60 * 1000
const TARGET_TIME = 20 * 60 * 1000

function getWeekCycle() {
  return `${dayjs().year()}-W${dayjs().week()}`
}

async function handleMessage(userId, username, groupId) {
  const now = new Date()

  await pool.query(
    `INSERT INTO users (telegram_id, username)
     VALUES ($1,$2)
     ON CONFLICT (telegram_id) DO NOTHING`,
    [userId, username]
  )

  const user = await pool.query(
    `SELECT id FROM users WHERE telegram_id=$1`,
    [userId]
  )

  const dbUserId = user.rows[0].id

  const session = await pool.query(
    `SELECT * FROM sessions WHERE user_id=$1 AND group_id=$2 AND active=true`,
    [dbUserId, groupId]
  )

  if (session.rows.length === 0) {
    await pool.query(
      `INSERT INTO sessions (user_id, group_id, start_time, last_message_time)
       VALUES ($1,$2,$3,$3)`,
      [dbUserId, groupId, now]
    )
    return
  }

  const s = session.rows[0]
  const diff = now - new Date(s.last_message_time)

  if (diff > MAX_INTERVAL) {
    await pool.query(
      `UPDATE sessions SET start_time=$1, last_message_time=$1 WHERE id=$2`,
      [now, s.id]
    )
    return
  }

  await pool.query(
    `UPDATE sessions SET last_message_time=$1 WHERE id=$2`,
    [now, s.id]
  )

  const duration = now - new Date(s.start_time)

  if (duration >= TARGET_TIME) {
    await pool.query(
      `INSERT INTO achievements (user_id, group_id, achieved_at, week_cycle)
       VALUES ($1,$2,$3,$4)`,
      [dbUserId, groupId, now, getWeekCycle()]
    )

    await pool.query(
      `UPDATE sessions SET active=false WHERE id=$1`,
      [s.id]
    )
  }
}

module.exports = { handleMessage }