interface AppError {
    type: string;
    message: string;
    httpStatus?: number;
}

export interface InvalidDataError extends AppError {
    type: 'InvalidData';
    message: string;
    httpStatus: 400;
}

export const createInvalidDataError = (_message: string): InvalidDataError => ({
    type: 'InvalidData',
    message: _message,
    httpStatus: 400
});