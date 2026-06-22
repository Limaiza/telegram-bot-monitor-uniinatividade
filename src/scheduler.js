const cron = require("node-cron");

const db = require("./db");

const {
buildDailyReport,
buildWeeklyFailures
} = require("./services/reportService");

module.exports = (bot) => {

cron.schedule(
"0 0 * * *",
async () => {

  const groups =
    await db.query(
      `
      SELECT *
      FROM groups
      WHERE report_group_id <> 0
      `
    );

  for (const group of groups.rows) {

    const report =
      await buildDailyReport(
        group.monitored_group_id
      );

    await bot.telegram.sendMessage(
      group.report_group_id,
      report
    );
  }
}

);

cron.schedule(
"59 23 * * 5",
async () => {

  const groups =
    await db.query(
      `
      SELECT *
      FROM groups
      WHERE report_group_id <> 0
      `
    );

  for (const group of groups.rows) {

    const report =
      await buildWeeklyFailures(
        group.monitored_group_id
      );

    await bot.telegram.sendMessage(
      group.report_group_id,
      report
    );
  }
}

);
};