import configuration from 'configuration';
import { LoggerOptions } from 'pino';

import { censor } from './censor';
import { sensitiveDataPaths } from './sensitiveDataPaths';

const {
    LOGGER: { level, prettyPrint },
    SERVICE: { name: serviceName, version },
} = configuration;

export const loggerConfiguration: LoggerOptions = {
    level,
    messageKey: 'message',
    errorKey: 'error',
    timestamp: () => `,"timestamp":"${Date.now()}"`,
    formatters: {
        level: label => ({ level: label }),
        bindings: bindings => ({
            ...bindings,
            serviceName,
            version,
        }),
    },
    redact: { paths: sensitiveDataPaths, censor },
    ...(prettyPrint && {
        transport: {
            target: './helpers/prettyPrint',
        },
    }),
};
