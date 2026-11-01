type RequiredEnvVars = readonly string[];

type NodeEnvWithRequiredVars<T extends RequiredEnvVars> = {
    [key in T[number]]: string;
} & NodeJS.ProcessEnv;

type AssertRequiredEnvVars = <const T extends RequiredEnvVars>(
    env: NodeJS.ProcessEnv,
    requiredEnvVars: T,
) => asserts env is NodeEnvWithRequiredVars<T>;

export const ensureRequiredEnvVars: AssertRequiredEnvVars = (
    env,
    requiredEnvVars,
) => {
    const missingVariables = requiredEnvVars.filter(envVar => !(envVar in env));

    if (missingVariables.length) {
        throw new Error(
            `Missing required environment variables: ${missingVariables.join(
                ', ',
            )}`,
        );
    }
};
