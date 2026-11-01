import { history } from '@prisma/client';

import { Execution } from '@definitions';

function mapHistoryEntity(history: history): Execution {
    return {
        id: history.id,
        name: history.name,
        startTime: history.startTime,
        endTime: history.endTime ?? undefined,
        maxVus: history.maxVus ? Number(history.maxVus) : undefined,
        responseTime: history.responseTime ?? undefined,
        status: history.status,
        groupName: history.group_name,
    };
}

export { mapHistoryEntity };
