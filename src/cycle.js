const db = require('./db')

async function getActiveCycle() {
  const result = await db.query(`
    SELECT *
    FROM cycles
    WHERE active = true
    LIMIT 1
  `)

  return result.rows[0]
}

module.exports = { getActiveCycle }