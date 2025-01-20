import {
  BadRequestException,
    CallHandler,
    ConflictException,
    ExecutionContext,
    ForbiddenException,
    HttpStatus,
    InternalServerErrorException,
    NestInterceptor,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import  { IResponse } from 'src/interface/Response';
export class Interceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
      return next.handle().pipe(
        map((data) => this.formatSuccessResponse(data)),
        catchError((error) => this.handleError(error))
      );
    }
    private formatSuccessResponse(data: T): IResponse<T> {
      const returnObj: IResponse<T> = {
        cached: false,
        timestamp: new Date().toISOString(),
        data: typeof data === 'string' ? null : data,
        message: typeof data === 'string' ? data : null,
      };
      return returnObj;
    }

    private handleError(error: ServiceException<ERR_TYPE>): Observable<never> {
      const errorObject = {
        data: null,
        message: error.message,
        cached: false,
        timestamp: new Date().toISOString(),
      }
      switch(error.name){
        case 'RESOURCE_CONFLICT':
          throw new ConflictException({...errorObject, statusCode: HttpStatus.CONFLICT});
        case 'ACCESS_FORBIDDEN':
          throw new ForbiddenException({...errorObject, statusCode: HttpStatus.FORBIDDEN});
        case 'REQ_MALFORMED':
          throw new BadRequestException({...errorObject, statusCode: HttpStatus.BAD_REQUEST});
        case 'UNAUTHORIZED':
          throw new UnauthorizedException({...errorObject,statusCode:HttpStatus.UNAUTHORIZED});
        case 'NOT_FOUND': 
          throw new NotFoundException({...errorObject, statusCode: HttpStatus.NOT_FOUND})
        default:
          console.log(error.message)
          throw new InternalServerErrorException({...errorObject})
      }

    }
  }