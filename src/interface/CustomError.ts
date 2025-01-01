export type ERR_TYPE = 
    | 'RESOURCE_CONFLICT'
    | 'ACCESS_FORBIDDEN'
    | 'UNAUTHORIZED'
    | 'REQ_MALFORMED';


export interface IServiceError<T> {
    throw: (err: T, message: string) => void;
}