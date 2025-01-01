import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisPolicy } from './redis.type';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
@Injectable()
export class RedisService {

    private policy= null;
    constructor(
        private readonly redis: Redis,
        policy: RedisPolicy,
        private serviceException: ServiceException<ERR_TYPE>
    ){ this.policy = `${policy}_`}
    async setTempData (key:string, data: any,expiry?:number){
        try{
            const doesExist = await this.getTempData(`${this.policy}${key}`)
            if(doesExist) this.serviceException.throw('RESOURCE_CONFLICT','data exists in the cache')
            if(expiry) await this.redis.set(`${this.policy}${key}`, JSON.stringify(data),'EX', expiry)
            else await this.redis.set(`${this.policy}${key}`, JSON.stringify(data),)
        }catch(err){
            if(err) throw err
        }
    }
    async getTempData (key: string){
        try{
            const data = await this.redis.get(`${this.policy}${key}`)
            return JSON.parse(data)
        }catch(err){
            if(err) throw err
        }
    }
    async dropTempData (key: string){
        try{
            await this.redis.del(`${this.policy}${key}`)
        }catch(err){
            if(err) throw err
        }
    }
}
