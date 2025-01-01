import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { comparePwd, hashFn } from './helper/bcrypt';
import { JwtEncodables } from 'src/utility/utility.type';
import { UserDTO } from './dto/signup.dto';
import { RedisService } from 'src/utility/redis/redis.service';
import { MailService } from 'src/utility/mail/mail.service';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
@Injectable()
export class AuthService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
         private userService: UserService,
         private jwtService: JwtService,
         private redisService: RedisService,
        private mailService: MailService,
    ) { }
    async signIn(data: SignInDto) {
        const { email, password } = data
        const userExist = await this.userService.findByCredential({ email });

        if (!userExist) this.serviceException.throw('RESOURCE_CONFLICT','user not found')
        const { password_hash, roleId, user_id } = userExist

        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) this.serviceException.throw('RESOURCE_CONFLICT','password does not match')

        const encodeBody = { userId: user_id, role: roleId }
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),

        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: userExist.user_id })
        return { username: userExist.username, access_token, refresh_token }
    }
    async signUp(data: UserDTO) {
        const { username, email, phone_number, first_name, projectId, invited_by } = data
        const userExist = await this.userService.findByCredential({
            username,
            email,
            phone_number,
            first_name,
            invited_by
        });
        if (userExist) this.serviceException.throw('RESOURCE_CONFLICT','user already exists')
        const hasedPwd = await hashFn(data.password_hash);
        const userData = {
            ...data,
            password_hash: hasedPwd,
            date_of_birth: new Date(data.date_of_birth)
        }
        if (projectId) await this.userService.createUser(userData, { projectId })
        else await this.userService.createUser(userData)
        return 'user registered'
    }
    async sendOtp(
        { resend, email }: { resend: boolean, email: string }
    ) {
        const resendOtp = Math.floor(10000 + Math.random() * 90000)
        const newDate = new Date(new Date().getTime() + 2 * 60 * 1000);
        const newUnixTime = Math.floor(newDate.getTime() / 1000);
        if (resend) {
            const doesExist = await this.redisService.getTempData(email)
            if (!doesExist) this.serviceException.throw('RESOURCE_CONFLICT','profile not found')
            await this.redisService.setTempData(email, { ...doesExist, otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        } else await this.redisService.setTempData(email, { otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        await this.mailService.sendOtp(email, resendOtp)
        return { expiresIn: newUnixTime }
    }
    async token(token: string) {
        const decoded: any = this.jwtService.verify(token, JwtEncodables.REFRESH_TOKEN)
        const doesExist = await this.userService.findByCredential({ user_id: decoded.userId })
        if (!doesExist.is_active) throw this.serviceException.throw('RESOURCE_CONFLICT','user not active')

        const encodeBody = { userId: decoded.userId, role: decoded.role }
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),
        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: doesExist.user_id })
        return { username: doesExist.username, access_token, refresh_token }
    }
    async verify(
        { email, otp }: { email: string, otp: number }
    ): Promise<string> {
        const tempUserData = await this.redisService.getTempData(email)
        if (!tempUserData) this.serviceException.throw('RESOURCE_CONFLICT','data not found')
        const currentUnixTime = Math.floor(Date.now() / 1000)
        if (Math.abs(currentUnixTime - tempUserData.otpExpiresAt) > 300) throw Error('otp expired')
        if (otp !== tempUserData?.otp) this.serviceException.throw('RESOURCE_CONFLICT','otp mismatched')
        return 'otp verified';
    }
}
