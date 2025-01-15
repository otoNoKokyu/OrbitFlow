import { Module, Global } from '@nestjs/common';
import { BaseService } from './service.base';
import { BaseController } from './controller.base';
import { BaseRepository } from './repository.base';

@Global()
@Module({
    providers: [BaseService, BaseController],
    exports: [BaseService, BaseController, BaseRepository],
})
export class CommonModule { }
