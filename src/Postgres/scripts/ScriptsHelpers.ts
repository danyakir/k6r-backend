import { scripts } from '@prisma/client';

import { Script } from '@definitions';

function mapScriptEntity(script: scripts): Script {
    return {
        id: script.id,
        name: script.name,
        description: script.description ?? undefined,
        memory: Number(script.memory),
        cpu: Number(script.cpu),
        lastRun: script.lastRun ?? undefined,
        isRunning: script.isRunning,
        groupName: script.group_name,
    };
}

export { mapScriptEntity };
