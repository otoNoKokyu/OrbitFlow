import { Module, Global } from '@nestjs/common';
import { MiddlewareException, ServiceException } from './CustomError';

@Global()
@Module({
    providers: [
        {
            provide: 'ServiceException',
            useClass: ServiceException
        },
        MiddlewareException
    ],
    exports: ['ServiceException',MiddlewareException],
})
export class HelperModule { }
