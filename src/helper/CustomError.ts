import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { ERR_TYPE, IServiceError } from "src/interface/CustomError";


/**
 * Later this classes will be formed based on Factory method.
 */
export class ServiceException<T extends string> extends Error implements IServiceError<T> {
    constructor(message: string, public name: T) {
        super(message);
        this.name = name
        Error.captureStackTrace(this, this.constructor);
    }

    throw(err: T, message: string) {
        throw new ServiceException(message, err);
    }

}

export class MiddlewareException extends HttpException {
    constructor(message: string, public code: HttpStatus) {
        super(message,code)
        Error.captureStackTrace(this, this.constructor);
    }

    throw(code: HttpStatus, message: string) {
        if(code === 401) throw new ConflictException(message,);
        
    }

}
