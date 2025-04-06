import { Module, Scope } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { RedisService } from 'src/utility/redis/redis.service';
import { RedisPolicy } from 'src/utility/redis/redis.type';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [],
  exports: [EventEmitterModule],
})
export class EventBusModule { }
