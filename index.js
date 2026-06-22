const bot = require("./src/bot");

const scheduler =
require("./src/scheduler");

const monitor =
require("./src/commands/monitor");

const report =
require("./src/commands/report");

const status =
require("./src/commands/status");

const messageHandler =
require("./src/handlers/messageHandler");

bot.command(
"monitor",
monitor
);

bot.command(
"report",
report
);

bot.command(
"status",
status
);

bot.on(
"message",
messageHandler
);

scheduler(bot);

bot.launch();

console.log(
"Bot iniciado."
);

process.once(
"SIGINT",
() => bot.stop("SIGINT")
);

process.once(
"SIGTERM",
() => bot.stop("SIGTERM")
);