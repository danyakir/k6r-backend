import { Execution } from './execution';
import { AuthCallbackQuery } from './schemas/auth';
import { HealthResponse } from './schemas/health';
import { EditScriptBody } from './schemas/scripts';
import { Settings } from './schemas/settings';
import { Script } from './script';
import { SSOGroups, SSOUser, TokenSet } from './sso';

export interface IHealthService {
    getLiveness(): HealthResponse;
    getReadiness(): Promise<HealthResponse>;
}

export interface IAuthenticationService {
    generateAuthenticationUrl(): string;
    handleAuthenticationCallback(query: AuthCallbackQuery): Promise<SSOUser>;
    authenticateUser(access_token: string): Promise<SSOGroups>;
    refresh(refresh_token: string): Promise<TokenSet>;
}

export interface IResource {
    name: string;
    connect(): Promise<void>;
    quit(): Promise<void>;
    isAvailable(): Promise<boolean>;
}

export interface IResourcesService {
    connectAll(): Promise<void>;
    quitAll(): Promise<void>;
    areAllAvailable(): Promise<boolean>;
}

export interface IScriptsService {
    getScripts(groupName: string): Promise<Script[]>;
    editScript(
        groupName: string,
        scriptId: string,
        payload: EditScriptBody,
    ): Promise<void>;
    runScript(groupName: string, scriptId: string): Promise<Execution>;
    abortScript(groupName: string, scriptId: string): Promise<void>;
    getRunningScript(scriptId: string): Promise<Execution>;
    getHistory(groupName: string): Promise<Execution[]>;
}

export interface ISettingsService {
    getSettings(groupName: string): Promise<Settings>;
    editSettings(groupName: string, settings: Settings): Promise<void>;
}
