import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import path from 'path'

const { combine, timestamp, printf, errors } = format

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}
const logDir = 'logs'
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const logFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
)

// Log filter
const errorFilter = format((info, opts) =>
  info.level === 'error' ? info : false
)

const infoFilter = format((info, opts) =>
  info.level === 'info' ? info : false
)

const debugFilter = format((info, opts) =>
  info.level === 'debug' ? info : false
)

// Log rotate
const logRotate = (
  filename: string,
  maxFiles: string,
  frequency?: string
): DailyRotateFile => {
  return new DailyRotateFile({
    frequency: frequency,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD HH-mm',
    zippedArchive: false,
    maxSize: '20m',
    dirname: logDir,
    maxFiles: maxFiles
  })
}

// Logger
const logFatal = createLogger({
  levels: logLevels,
  level: 'error',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: dateFormat }),
    logFormat
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'fatal.log') })
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exception.log') })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejection.log') })
  ]
})

const logger = createLogger({
  levels: logLevels,
  level: 'debug',
  format: combine(timestamp({ format: dateFormat }), logFormat),
  transports: [
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(
        errorFilter(),
        errors({ stack: true }),
        timestamp(),
        logFormat
      )
    }),
    new transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
      format: combine(infoFilter(), timestamp(), logFormat)
    }),
    new transports.File({
      filename: path.join(logDir, 'null.log'),
      level: 'debug',
      format: combine(debugFilter(), timestamp(), logFormat)
    })
  ]
})

const logResReq = createLogger({
  levels: logLevels,
  level: 'info',
  format: combine(timestamp({ format: dateFormat }), logFormat),
  transports: [logRotate('resreq', '30d', '30m')]
})

const logLogin = createLogger({
  levels: logLevels,
  level: 'info',
  format: combine(timestamp({ format: dateFormat }), logFormat),
  transports: [logRotate('login', '30d')]
})

export { logger, logResReq, logFatal, logLogin }
