const winston = require("winston");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");
require('dotenv').config();

// Create a Logtail client
const logtail = new Logtail(process.env.LOGTAIL_API_KEY);

// Create a Winston logger - passing in the Logtail transport
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new LogtailTransport(logtail)],
});

module.exports = logger;
