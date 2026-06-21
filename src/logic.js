const db = require('./db')
const { getActiveCycle } = require('./cycle')

const MAX_INTERVAL = 4 * 60 * 1000
const TARGET_TIME = 20 * 60 * 1000

async function handleMessage(userId, username, firstName, lastName, groupId) {
  if (!userId || !groupId) return

  const now = new Date()

  // =========================
  // 👤 SALVAR USUÁRIO
  // =========================
  await db.query(`
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
  `, [userId, username, firstName, lastName])

  const userRes = await db.query(`
    SELECT * FROM users WHERE telegram_id = $1
  `, [userId])

  const user = userRes.rows[0]
  if (!user) return

  const cycle = await getActiveCycle()
  if (!cycle) return

  // =========================
  // 🏆 já bateu meta?
  // =========================
  const check = await db.query(`
    SELECT 1 FROM achievements
    WHERE user_id = $1 AND cycle_id = $2
    LIMIT 1
  `, [user.id, cycle.id])

  if (check.rows.length) return

  // =========================
  // ⏱ sessão ativa?
  // =========================
  const sessionRes = await db.query(`
    SELECT * FROM sessions
    WHERE user_id = $1 AND active = true
    ORDER BY id DESC
    LIMIT 1
  `, [user.id])

  let session = sessionRes.rows[0]

  // cria sessão se não existir
  if (!session) {
    await db.query(`
      INSERT INTO sessions
      (user_id, group_id, start_time, last_message_time, active)
      VALUES ($1,$2,$3,$3,true)
    `, [user.id, groupId, now])

    return
  }

  const lastMsg = new Date(session.last_message_time)
  const diff = now - lastMsg

  // =========================
  // ⛔ sessão expirada
  // =========================
  if (diff > MAX_INTERVAL) {
    await db.query(`
      UPDATE sessions
      SET start_time = $1,
          last_message_time = $1
      WHERE id = $2
    `, [now, session.id])

    return
  }

  // =========================
  // 🔄 atualizar sessão
  // =========================
  await db.query(`
    UPDATE sessions
    SET last_message_time = $1
    WHERE id = $2
  `, [now, session.id])

  const startTime = new Date(session.start_time)
  const duration = now - startTime

  // =========================
  // 🏆 meta atingida
  // =========================
  if (duration >= TARGET_TIME) {

    await db.query(`
      INSERT INTO achievements
      (user_id, username, achieved_at, cycle_id)
      VALUES ($1,$2,$3,$4)
    `, [user.id, username, now, cycle.id])

    await db.query(`
      UPDATE sessions SET active = false WHERE id = $1
    `, [session.id])

    console.log(`🏆 ${username} bateu 20 min`)
  }
}

module.exports = { handleMessage }