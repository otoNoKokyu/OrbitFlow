import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';
import  { IErrResponse, IResponse } from 'src/interface/Response';

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
  
    private handleError(error: Error): Observable<never> {
      if (error instanceof HttpException) {
        const { message} = error.getResponse() as IResponse<any>;
        throw new HttpException({ message, cached: false, timestamp: new Date().toISOString() }, error.getStatus());
      }
      throw error
    }
  }