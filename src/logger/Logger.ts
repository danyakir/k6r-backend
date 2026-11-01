import * as httpContext from 'http-context-nodejs';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';

import { loggerConfiguration } from './helpers';

type LogMeta = Record<string, unknown>;

interface LogMethod {
    (message: string): void;
    (message: LogMeta): void;
    (message: string, meta: LogMeta): void;
}

export class Logger {
    private readonly logger: PinoLogger;

    constructor(options: LoggerOptions) {
        this.logger = pino(options);
    }

    private formatMessage(message: string | LogMeta, meta?: LogMeta): object {
        const dataToLog =
            typeof message === 'string' ? { message, ...meta } : message;

        const requestMetadata: LogMeta = httpContext.get('requestMetadata');

        return {
            ...dataToLog,
            ...requestMetadata,
        };
    }

    info: LogMethod = (message: string | LogMeta, meta?: LogMeta) => {
        this.logger.info(this.formatMessage(message, meta));
    };

    error: LogMethod = (message: string | LogMeta, meta?: LogMeta) => {
        this.logger.error(this.formatMessage(message, meta));
    };

    debug: LogMethod = (message: string | LogMeta, meta?: LogMeta) => {
        this.logger.debug(this.formatMessage(message, meta));
    };

    warn: LogMethod = (message: string | LogMeta, meta?: LogMeta) => {
        this.logger.warn(this.formatMessage(message, meta));
    };
}

export default new Logger(loggerConfiguration);
