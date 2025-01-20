import { Inject, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { comparePwd, hashFn } from './helper/bcrypt';
import { JwtEncodables } from 'src/utility/utility.type';
import { RedisService } from 'src/utility/redis/redis.service';
import { MailService } from 'src/utility/mail/mail.service';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { User } from '../user/model/User.model';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { isEmptyObject } from 'src/utility/NullishUtills';
import { UserProjectService } from '../project/userProject.service';
import { RoleService } from '../role/role.service';
import { RoleEnum } from '../role/utility/roles.enum';
@Injectable()
export class AuthService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
         private userService: UserService,
         private jwtService: JwtService,
         private redisService: RedisService,
        private mailService: MailService,
        private userProjectService: UserProjectService,
        private roleService: RoleService
    ) {
     }
    async signIn(data: {email:string,password:string}) {
        const { email, password } = data
        const userExist = await this.userService.findOne({ email });
        if (!userExist)  this.serviceException.throw('RESOURCE_CONFLICT','user not found')
        const { password_hash, roleId, user_id } = userExist

        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) this.serviceException.throw('RESOURCE_CONFLICT','password does not match')

        const encodeBody = { userId: user_id, role: roleId, username: userExist.username }

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),

        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: user_id })
        return { username: userExist.username, access_token, refresh_token }
    }
    async signUp(data:  ModelCreationAttributes<User> & {projectId:string}) {
        const { username, email, phone_number, first_name, invited_by } = data
        const filter = {
            username,
            email,
            phone_number,
            first_name,
        }
        if( invited_by) filter['invited_by'] = invited_by
        const userExist = await this.userService.findOne(filter);
        if (userExist) this.serviceException.throw('RESOURCE_CONFLICT','user already exists')
        const hasedPwd = await hashFn(data.password_hash);
        data.password_hash = hasedPwd

        if(data.projectId) {
            const invitedRoleId = data.roleId
            delete data.roleId
            const user = await this.userService.create(data)
            await this.userProjectService.create({
                projectId:data.projectId,
                roleId: invitedRoleId,
                userId: user.user_id,
                isActive:true
            })
            return user;
        }
        const {role_id} = await this.roleService.findOne({role: RoleEnum.ADMIN})
        const user = await this.userService.create({...data, roleId: role_id})
        return user


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
        const doesExist = await this.userService.findOne({ user_id: decoded.userId })
        if (!doesExist.is_active) throw this.serviceException.throw('RESOURCE_CONFLICT','user not active')

        const encodeBody = { userId: decoded.userId, role: decoded.role, username: decoded.username }
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
