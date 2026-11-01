export class ServiceError extends Error {
    private _extraDetails?: Record<string, unknown>;

    constructor(message: string, extraDetails?: Record<string, unknown>) {
        super(message);
        this.name = 'ServiceError';

        this._extraDetails = extraDetails;
    }

    get extraDetails() {
        return this._extraDetails;
    }
}
