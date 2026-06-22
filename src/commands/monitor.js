const db = require("../db");

module.exports = async (ctx) => {

if (ctx.chat.type === "private")
return;

const exists = await db.query(
  `SELECT * FROM groups WHERE monitored_group_id = $1`,
  [ctx.chat.id]
);

if (exists.rowCount > 0) {
return ctx.reply(
"Este grupo já está configurado."
);
}

await db.query(
  `INSERT INTO groups( monitored_group_id, monitored_group_name, report_group_id, report_group_name, created_by ) VALUES( $1, $2, 0, '', $3 )`,
  [
    ctx.chat.id,
    ctx.chat.title,
    ctx.from.id
  ]
);

ctx.reply(
"✅ Grupo monitorado registrado.\nAgora execute /report no grupo de relatórios."
);
};