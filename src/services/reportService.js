const db = require("../db");

async function buildDailyReport(groupId) {

const result = await db.query(
  `SELECT gm.first_name, gm.username, a.achieved_at FROM achievements a JOIN group_members gm ON gm.telegram_id = a.telegram_id AND gm.group_id = a.group_id WHERE a.group_id = $1 AND a.achievement_date = CURRENT_DATE - INTERVAL '1 day' ORDER BY a.achieved_at`,
  [groupId]
);

let text =
"📊 RELATÓRIO DIÁRIO\n\n";

result.rows.forEach(row => {

const name =
  row.first_name ||
  row.username ||
  "Usuário";

text +=
  `✅ ${name}\n`;

text +=
  `⏰ ${new Date(
    row.achieved_at
  ).toLocaleTimeString("pt-BR")}\n\n`;

});

text +=
  `Total: ${result.rows.length} metas;`;

return text;
}

async function buildWeeklyFailures(groupId) {

const result = await db.query(
`SELECT gm.first_name, gm.username FROM group_members gm WHERE gm.group_id = $1 AND NOT EXISTS ( SELECT 1 FROM achievements a WHERE a.telegram_id = gm.telegram_id AND a.group_id = gm.group_id AND a.achievement_date >= CURRENT_DATE - INTERVAL '7 days' )`,
[groupId]
);

if (!result.rows.length) {
return "🎉 Todos bateram meta!";
}

let text =
"🚨 NÃO BATERAM META ESTA SEMANA\n\n";

result.rows.forEach(user => {

const name =
  user.first_name ||
  user.username ||
  "Usuário";

text += `❌ ${name}\n`;

});

return text;
}

module.exports = {
buildDailyReport,
buildWeeklyFailures
};