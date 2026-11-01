import { injectable } from 'tsyringe';

import { ISettingsService } from '@definitions';
import { Settings } from '@schemas';
import { GroupsRepository } from '@postgres';

import { GitLabHelper } from './Gitlab/GitLabHelper';
import { OpenShiftHelper } from './OpenShift/OpenShiftHelper';

@injectable()
export class SettingsService implements ISettingsService {
    constructor(
        private readonly groupsRepository: GroupsRepository,
        private readonly openShiftHelper: OpenShiftHelper,
        private readonly gitLabHelper: GitLabHelper,
    ) {}

    public async getSettings(groupName: string): Promise<Settings> {
        return await this.groupsRepository.getSettings(groupName);
    }

    public async editSettings(
        groupName: string,
        settings: Settings,
    ): Promise<void> {
        this.cleanSettings(settings);
        await this.groupsRepository.editGroup(groupName, settings);
        this.openShiftHelper.removeCurrentClient(groupName);
        this.gitLabHelper.removeCurrentClient(groupName);
    }

    private cleanSettings(settings: Settings) {
        Object.keys(settings).forEach(key => {
            if (typeof settings[key] === 'string' && settings[key] === '') {
                settings[key] = null;
            }
        });
    }
}
