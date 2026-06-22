const db = require("../db");

module.exports = async (ctx) => {

if (ctx.chat.type === "private")
return;

const row = await db.query(
  `SELECT * FROM groups WHERE report_group_id = 0 LIMIT 1`
);

if (row.rowCount === 0) {
return ctx.reply(
"Configure primeiro um grupo monitorado usando /monitor"
);
}

await db.query(
  `UPDATE groups SET report_group_id = $1, report_group_name = $2 WHERE id = $3`,
  [
    ctx.chat.id,
    ctx.chat.title,
    row.rows[0].id
  ]
);

ctx.reply(
"✅ Grupo de relatório configurado."
);
};