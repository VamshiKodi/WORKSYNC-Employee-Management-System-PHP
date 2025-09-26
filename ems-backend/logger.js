const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, errors } = format;

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'ems-backend' },
  transports: [
    new transports.Console()
  ],
});

module.exports = logger;
