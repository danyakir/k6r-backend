import { StatusCodes } from 'http-status-codes';

export abstract class ApiError extends Error {
    private _statusCode: StatusCodes;
    private _extraDetails: Record<string, unknown>;

    constructor(
        name: string,
        message: string,
        statusCode: StatusCodes,
        extraDetails?: Record<string, unknown>,
    ) {
        super(message, extraDetails);

        this.name = name;
        this._statusCode = statusCode;
        this._extraDetails = extraDetails;
    }

    get statusCode() {
        return this._statusCode;
    }

    get extraDetails() {
        return this._extraDetails;
    }
}
