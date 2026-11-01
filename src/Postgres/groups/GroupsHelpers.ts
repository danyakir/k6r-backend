import { V1EnvVar } from '@kubernetes/client-node';
import { groups } from '@prisma/client';

import configuration from 'configuration';
import { Group, ValidatedGroup } from '@definitions';
import { ServiceError, UnprocessableError } from '@errors';
import logger from '@logger';
import { security } from '@utils';

function mapGroupEntity(group: groups): Group {
    const env = group.enviormentParams;
    validateEnviormentVariables(env);

    return {
        ...group,
        gitlabUrl: group.gitlabUrl ?? undefined,
        gitlabToken: group.gitlabToken
            ? security.decrypt(group.gitlabToken)
            : undefined,
        ocUrl: group.ocUrl ?? undefined,
        ocToken: group.ocToken ? security.decrypt(group.ocToken) : undefined,
        ocNamespace: group.ocNamespace ?? undefined,
        scriptsRoute: group.scriptsRoute ?? undefined,
        prometheusUrl: group.prometheusUrl ?? undefined,
        branchName: group.branchName ?? undefined,
        enviormentParams: env,
    };
}

function validateGroup(group: groups): ValidatedGroup {
    if (!group) {
        logger.error(`GroupsRepository: couldn't find group`, {
            groupName: group.name,
        });

        throw new ServiceError(`Cannot find group in db`, {
            groupName: group.name,
        });
    }

    if (!group.gitlabUrl || !group.gitlabToken) {
        logger.error(`GroupsRepository: missing gitlab info`, {
            groupName: group.name,
        });

        throw new UnprocessableError(`Gitlab configuration is missing`);
    }

    if (!group.ocUrl || !group.ocToken || !group.ocNamespace) {
        logger.error(`GroupsRepository: missing openShift info`, {
            groupName: group.name,
        });

        throw new UnprocessableError(`OpenShift configuration is missings`);
    }

    validateEnviormentVariables(group.enviormentParams);

    return {
        id: group.id,
        name: group.name,
        gitlabUrl: group.gitlabUrl,
        gitlabToken: security.decrypt(group.gitlabToken),
        ocUrl: group.ocUrl,
        ocToken: security.decrypt(group.ocToken),
        ocNamespace: group.ocNamespace,
        scriptsRoute:
            group.scriptsRoute ?? configuration.DEFAULTS.GROUPS.scriptsRoute,
        branchName:
            group.branchName ?? configuration.DEFAULTS.GROUPS.branchName,
        prometheusUrl:
            group.prometheusUrl ?? configuration.DEFAULTS.GROUPS.prometheusUrl,
        enviormentParams: group.enviormentParams,
    };
}

function validateEnviormentVariables(
    value: unknown,
): asserts value is V1EnvVar[] {
    if (typeof value != 'object' || !Array.isArray(value)) {
        throw new UnprocessableError(`Script's enviorment params are invalid`);
    }

    const areItemsValid = value.every(
        item => typeof item === 'object' && 'name' in item && 'value' in item,
    );

    if (!areItemsValid) {
        throw new UnprocessableError(`Script's enviorment params are invalid`);
    }
}

export { mapGroupEntity, validateGroup };
