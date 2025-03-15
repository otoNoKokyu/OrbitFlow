import { Module, Global } from '@nestjs/common';
import {  ServiceException } from './CustomError';
import { TransactionManagerService } from './transaction.manager';

@Global()
@Module({
    providers: [
        {
            provide: 'ServiceException',
            useClass: ServiceException
        },
        
        TransactionManagerService
    ],
    exports: ['ServiceException',TransactionManagerService],
})
export class HelperModule { }
