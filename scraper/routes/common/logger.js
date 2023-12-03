import winston from "winston";

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    env === 'dev' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.timestamp(),
    winston.format.errors({stack: true}),
    winston.format.splat(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
