const db = require("../db");

const {
processSession
} = require("../services/sessionService");

module.exports = async (ctx) => {

if (!ctx.message)
return;

const group = await db.query(
  `SELECT * FROM groups WHERE monitored_group_id = $1`,
  [ctx.chat.id]
);

if (!group.rowCount)
return;

const user = ctx.from;

await db.query(
  `INSERT INTO group_members( telegram_id, group_id, username, first_name, last_name ) VALUES( $1,$2,$3,$4,$5 ) ON CONFLICT( telegram_id, group_id ) DO NOTHING`,
  [
user.id,
ctx.chat.id,
user.username,
user.first_name,
user.last_name
]
);

await db.query(
  `INSERT INTO messages( telegram_id, group_id ) VALUES($1,$2)`,
[
user.id,
ctx.chat.id
]
);

const achieved =
await processSession(
user.id,
ctx.chat.id
);

if (achieved) {

await ctx.reply(
  `🏆 ${user.first_name} completou a meta diária de 20 minutos contínuos!`
);

}
};