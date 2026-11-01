import { PinoPretty } from 'pino-pretty';

import { getColorByStatus } from './getColorByStatus';

export default () =>
    PinoPretty({
        colorize: true,
        colorizeObjects: true,
        messageKey: 'message',
        timestampKey: 'timestamp',
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        ignore: 'pid,hostname,serviceName,route,action,environment,version',
        customColors: {
            message: 'magenta',
            info: 'cyan',
            debug: 'green',
            trace: 'bgBlackBright',
        },
        useOnlyCustomProps: false,
        messageFormat(log, messageKey, _levelLabel, { colors }) {
            const message = log[messageKey];

            return typeof log.route === 'string'
                ? `${message} ${colors.yellow(` # ${log.route}`)}`
                : `${message}`;
        },
        customPrettifiers: {
            requestId: (value, _key, _log, { colors }) =>
                colors.gray(value.toString()),
            status: value => getColorByStatus(Number(value))(value.toString()),
            duration: (value, _key, _log, { colors }) =>
                colors.green(value.toString()),
        },
    });
