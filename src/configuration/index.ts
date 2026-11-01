import 'dotenv/config';
import { ensureRequiredEnvVars } from './ensureRequiredEnvVars';

const { env } = process;

// Edit this to be correct
ensureRequiredEnvVars(env, [
    'CRYPTO_KEY',
    'DATABASE_URL',
    'SSO_PROVIDER_URL',
    'SSO_CLIENT_ID',
    'SSO_CLIENT_SECRET',
    'SSO_REDIRECT_URI',
    'COOKIES_DOMAIN',
]);

const isProduction = env.NODE_ENV === 'prod';

export default Object.freeze({
    SERVICE: {
        env: env.NODE_ENV || 'local',
        name: env.APP_NAME || 'k6-cloud-runner',
        version: env.APP_VERSION || 'local',
        host: isProduction ? '0.0.0.0' : undefined,
        port: Number(env.PORT) || 3000,
    },
    LOGGER: {
        level: env.LOGGER_LEVEL || 'info',
        prettyPrint: !isProduction,
    },
    DB: {
        url: env.DATABASE_URL,
    },
    AUTHENTICATION: {
        SSO: {
            providerUrl: env.SSO_PROVIDER_URL,
            clientId: env.SSO_CLIENT_ID,
            clientSecret: env.SSO_CLIENT_SECRET,
            redirectURI: env.SSO_REDIRECT_URI,
            cookiesDomain: isProduction ? env.COOKIES_DOMAIN : undefined,
        },
    },
    CLIENT: {
        home: env.CLIENT_HOME_ROUTE || 'http://localhost:5173/',
    },
    SECURITY: {
        KEY: env.CRYPTO_KEY,
    },
    DEFAULTS: {
        GROUPS: {
            scriptsRoute: env.SCRIPTS_ROUTE || 'src/load_scripts',
            branchName: env.BRANCH_NAME || 'main',
            prometheusUrl:
                env.PROMETHEUS_URL || 'https://prometheus.k6.example.com',
        },
        OC: {
            timeBetweenJobCheckups: env.TIME_BETWEEN_JOB_CHECKUPS_MS || 60000,
        },
    },
});
