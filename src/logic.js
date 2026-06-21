const db = require('./db')
const { getActiveCycle } = require('./cycle')

const MAX_INTERVAL = 4 * 60 * 1000
const TARGET_TIME = 20 * 60 * 1000

async function handleMessage(
userId,
username,
firstName,
lastName,
groupId
) {
try {

if (!userId || !groupId) return

const now = new Date()

const userResult = await db.query(`
  INSERT INTO users (
    telegram_id,
    username,
    first_name,
    last_name
  )
  VALUES ($1,$2,$3,$4)
  ON CONFLICT (telegram_id)
  DO UPDATE SET
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name
  RETURNING *
`, [
  userId,
  username,
  firstName,
  lastName
])

const user = userResult.rows[0]

const cycle = await getActiveCycle()

if (!cycle) {
  console.log('⚠️ Nenhum ciclo ativo')
  return
}

const check = await db.query(`
  SELECT 1
  FROM achievements
  WHERE user_id = $1
  AND cycle_id = $2
  LIMIT 1
`, [
  user.id,
  cycle.id
])

if (check.rows.length) {
  return
}

const sessionRes = await db.query(`
  SELECT *
  FROM sessions
  WHERE user_id = $1
  AND group_id = $2
  AND active = true
  ORDER BY id DESC
  LIMIT 1
`, [
  user.id,
  groupId
])

let session = sessionRes.rows[0]

if (!session) {

  await db.query(`
    INSERT INTO sessions (
      user_id,
      group_id,
      start_time,
      last_message_time,
      active
    )
    VALUES ($1,$2,$3,$3,true)
  `, [
    user.id,
    groupId,
    now
  ])

  return
}

const lastMsg = new Date(session.last_message_time)
const diff = now - lastMsg

if (diff > MAX_INTERVAL) {

  await db.query(`
    UPDATE sessions
    SET start_time = $1,
        last_message_time = $1
    WHERE id = $2
  `, [
    now,
    session.id
  ])

  return
}

await db.query(`
  UPDATE sessions
  SET last_message_time = $1
  WHERE id = $2
`, [
  now,
  session.id
])

const startTime = new Date(session.start_time)
const duration = now - startTime

if (duration >= TARGET_TIME) {

  await db.query(`
    INSERT INTO achievements (
      user_id,
      username,
      achieved_at,
      cycle_id
    )
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (user_id, cycle_id)
    DO NOTHING
  `, [
    user.id,
    username,
    now,
    cycle.id
  ])

  await db.query(`
    UPDATE sessions
    SET active = false
    WHERE id = $1
  `, [session.id])

  console.log(`🏆 ${username || userId} bateu 20 min`)
}

} catch (err) {
console.error('Erro handleMessage:', err)
}
}

module.exports = { handleMessage }
