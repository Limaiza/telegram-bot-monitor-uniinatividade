const fs = require("fs");
const path = require("path");

const logsDir =
  path.join(
    __dirname,
    "../../logs"
  );

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile =
  path.join(
    logsDir,
    "bot.log"
  );

function log(message) {

  const line =
    `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFileSync(
    logFile,
    line,
    "utf8"
  );

  console.log(message);
}

module.exports = log;