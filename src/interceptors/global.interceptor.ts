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
                const returnObj:any = {
                    cached: false,
                    timestamp: new Date().toISOString(),
                }
                if (typeof data === 'string'){
                    returnObj.data = null
                    returnObj.message = data
                }else{
                    returnObj.message = data.message??null;
                    returnObj.data = data
                }
                return returnObj
            }
            ),
            catchError((err: HttpException) => {
                console.log(err)
                const { message } = err.getResponse() as IErrResponse
                const customError = {
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
