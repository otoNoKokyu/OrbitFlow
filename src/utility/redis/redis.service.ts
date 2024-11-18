import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisPolicy } from './redis.type';
@Injectable()
export class RedisService {

    private policy= null;
    constructor( @InjectRedis() private readonly redis: Redis = redis, policy: RedisPolicy){
        this.policy = `${policy}_`
    }
    async setTempData (data: any){
        try{
            const doesExist = await this.getTempData(`${this.policy}${data.email}`)
            if(doesExist) throw Error("data exists in cache")
            await this.redis.set(`${this.policy}${data.email}`, JSON.stringify(data),'EX', 160)
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
