import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';
import  { IErrResponse, IResponse } from 'src/interface/Response';

@Injectable()
export class Interceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T> | any> {
        return next.handle().pipe(
            map((data) => {
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: 'Request was successful',
                    data: data,
                    cached: false,
                    timestamp: new Date().toISOString(),
                }
            }
            ),
            catchError((err: HttpException) => {
                const { message, statusCode } = err.getResponse() as IErrResponse
                const customError = {
                    statusCode,
                    message,
                    data: null,
                    cached: false,
                    timestamp: new Date().toISOString(),
                }
                return throwError(() => new HttpException(customError, err.getStatus()));
            }),
        );
    }
}
