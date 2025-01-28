export type ERR_TYPE = 
    | 'RESOURCE_CONFLICT'
    | 'ACCESS_FORBIDDEN'
    | 'UNAUTHORIZED'
    | 'REQ_MALFORMED'
    | 'NOT_FOUND';


export interface IServiceError<T> {
    throw: (err: T, message: string) => void;
}