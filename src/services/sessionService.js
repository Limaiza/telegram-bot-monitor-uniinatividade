const db = require("../db");

const {
registerAchievement
} = require("./achievementService");

const GOAL_MINUTES = 20;
const MAX_IDLE_MINUTES = 4;

async function processSession(userId, groupId) {

const now = new Date();

const result = await db.query(
  `SELECT * FROM chat_sessions WHERE telegram_id = $1 AND group_id = $2`,
  [userId, groupId]
);

const session = result.rows[0];

if (!session) {

await db.query(
  `
  INSERT INTO chat_sessions(
    telegram_id,
    group_id,
    started_at,
    last_message_at
  )
  VALUES($1,$2,$3,$4)
  `,
  [
    userId,
    groupId,
    now,
    now
  ]
);

return false;

}

const idleMinutes =
(now - new Date(session.last_message_at))
/ 1000
/ 60;

let startedAt =
new Date(session.started_at);

if (idleMinutes > MAX_IDLE_MINUTES) {
startedAt = now;
}

await db.query(
`UPDATE chat_sessions SET started_at = $3, last_message_at = $4 WHERE telegram_id = $1 AND group_id = $2`,
[
userId,
groupId,
startedAt,
now
]
);

const activeMinutes =
(now - startedAt)
/ 1000
/ 60;

const already = await db.query(
  `SELECT 1 FROM achievements WHERE telegram_id = $1 AND group_id = $2 AND achievement_date = CURRENT_DATE`,
  [
    userId,
    groupId
  ]
);

if (
activeMinutes >= GOAL_MINUTES &&
already.rowCount === 0
) {

await registerAchievement(
  userId,
  groupId
);

return true;

}

return false;
}

module.exports = {
processSession
};