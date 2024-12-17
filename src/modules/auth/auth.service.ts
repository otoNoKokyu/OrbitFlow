import { Body, ConflictException, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';
import { ok } from 'assert';
import { RedisService } from 'src/utility/redis/redis.service';
import { UserService } from '../user/user.service';
import { MailService } from 'src/utility/mail/mail.service';
import { UserDTO } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor (
        private redisSerice: RedisService,
        private usersService: UserService,
        private mailService: MailService
    ) {}
    async verfiy(email: string, otp: number) {
        try {
            const tempUserData = await this.redisSerice.getTempData(email);
            if (!tempUserData) throw new ConflictException('data not found')
            const currentUnixTime = Math.floor(Date.now() / 1000)
            if (Math.abs(currentUnixTime - tempUserData.otpExpiresAt) > 300) throw new ConflictException('otp expired')
    
            if (otp !== tempUserData?.otp) throw new ConflictException('otp mismatched')
    
            const { assigned_role, projectId } = tempUserData
    
            if (assigned_role && projectId) await this.usersService.createUser(tempUserData, { assigned_role, projectId })
            else await this.usersService.createUser(tempUserData, projectId);
            return ok('user verified');
        } catch {
            new UnauthorizedException(); 
        }
    }
    sendOTP = async (resend: boolean, email: string, user: UserDTO) => {
        try {
            const resendOtp = Math.floor(10000 + Math.random() * 90000)
                    const newDate = new Date(new Date().getTime() + 2 * 60 * 1000);
                    const newUnixTime = Math.floor(newDate.getTime() / 1000);
                    if (resend) {
                        const doesExist = await this.redisSerice.getTempData(email)
                        if (!doesExist) throw new ConflictException('profile not found')
                        await this.redisSerice.setTempData(email, { ...doesExist, otp: resendOtp, otpExpiresAt: newUnixTime })
            
                    } else await this.redisSerice.setTempData(user.email, { ...user, otp: resendOtp, otpExpiresAt: newUnixTime })
            
                    await this.mailService.sendOtp(email, resendOtp)
                    return { expiresIn: newUnixTime }
        }
        catch {
            new UnauthorizedException();
        }
    }

}
