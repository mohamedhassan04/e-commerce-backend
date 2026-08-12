import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { blue, cyan, italic, yellowBright } from 'colorette';

const alignColorsAndTime = winston.format.combine(
  winston.format.label({
    label: '[LOGGER]',
  }),
  winston.format.timestamp({
    format: 'YY-MM-DD HH:mm:ss',
  }),
  winston.format.printf((info) => {
    const coloredTimestamp = italic(cyan(`[${info.timestamp}]`));
    const coloredLevel = italic(blue(`[${info.level}]`));
    const coloredMessage = italic(yellowBright(info.message as string));

    return `${coloredTimestamp}  ${coloredLevel} ${coloredMessage}`;
  }),
);

// Create the logger instance
export const winstonLogger = WinstonModule.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: alignColorsAndTime,
    }),
  ],
});
