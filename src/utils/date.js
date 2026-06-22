const dayjs = require("dayjs");

const utc =
  require("dayjs/plugin/utc");

const timezone =
  require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ =
  "America/Sao_Paulo";

function now() {
  return dayjs().tz(TZ);
}

function today() {
  return now().format("YYYY-MM-DD");
}

function format(date) {

  return dayjs(date)
    .tz(TZ)
    .format(
      "DD/MM/YYYY HH:mm:ss"
    );
}

module.exports = {
  now,
  today,
  format,
  TZ
};