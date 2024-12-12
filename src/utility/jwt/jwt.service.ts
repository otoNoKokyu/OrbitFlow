import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtEncodableExpiry, JwtEncodables } from '../utility.type';
import { JwtPayload, verify, sign } from 'jsonwebtoken';

@Injectable()
export class JwtService {

    constructor(){}
    public async sign<T extends object>(data: T, policy: JwtEncodables): Promise<string> {  
        try {
            const inferedPolicy = process.env[policy];
            return  await sign(
                data,
                inferedPolicy,
                {expiresIn:JwtEncodableExpiry[inferedPolicy]}
            );
        } catch (error) {
            console.error('Token signing failed:', error.message);
            throw new Error('Token signing failed');
        }      

    }
    public verify(token: string, policy: JwtEncodables): string | JwtPayload| any {
        try {
            const secret = process.env[policy];
            if (!secret) throw new Error(`Environment variable ${policy} is not defined.`);
            const data = jwt.verify(token, secret);
            return typeof data === 'string' ? data : (data as JwtPayload);
        } catch (error) {
            console.error('Token verification failed:', error.message);
            throw new Error('Invalid token');
        }
    }
    
    
}
