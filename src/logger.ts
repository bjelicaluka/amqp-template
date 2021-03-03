import * as winston from 'winston';

const { combine, timestamp, label, printf } = winston.format;
 
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${`[${timestamp} ${label}`.padEnd(25)}: ${level.toLocaleUpperCase().padStart(5)}] - [ Message: ${message} ]`;
});

const isProductionEnv = process.env.NODE_ENV === 'production';

const loggerTransports: winston.transport | winston.transport[] = [
  new winston.transports.Console({ level: isProductionEnv ? 'warn' : 'debug' }),
  new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
  new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' }),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
];

!isProductionEnv && loggerTransports.push(new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }));

export const Logger = winston.createLogger({
  format: combine(
    label({ label: '' }),
    timestamp(),
    myFormat
  ),
  transports: [
    ...loggerTransports
  ]
});