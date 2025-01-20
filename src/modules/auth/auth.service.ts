import { Inject, Injectable } from '@nestjs/common';
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
import { UserProjectService } from '../project/userProject.service';
import { UserSecurityService } from 'src/utility/user-security/user-security.service';
import { ForgetPasswordDto } from './dto/forget.password.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
        private userService: UserService,
        private jwtService: JwtService,
        private redisService: RedisService,
        private mailService: MailService,
        private userProjectService: UserProjectService,
        private userSecurityService: UserSecurityService,
    ) {
    }
    async signIn(data: { email: string, password: string }) {
        const { email, password } = data
        const userExist = await this.userService.findOne({ email });
        if (!userExist) this.serviceException.throw('RESOURCE_CONFLICT', 'user not found')
        const { password_hash, roleId, user_id } = userExist

        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) this.serviceException.throw('RESOURCE_CONFLICT', 'password does not match')

        const encodeBody = { userId: user_id, role: roleId, username: userExist.username }

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),

        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: user_id })
        return { username: userExist.username, access_token, refresh_token }
    }
    async signUp(data: ModelCreationAttributes<User> & { projectId: string }) {
        const { username, email, phone_number, first_name, invited_by, roleId, projectId } = data
        const filter = {
            username,
            email,
            phone_number,
            first_name,
            roleId
        }
        if (invited_by) filter['invited_by'] = invited_by
        const userExist = await this.userService.findOne(filter);
        if (userExist) this.serviceException.throw('RESOURCE_CONFLICT', 'user already exists')
        const hasedPwd = await hashFn(data.password_hash);
        data.password_hash = hasedPwd

        const user = await this.userService.create(data)
        if (data.projectId) {
            await this.userProjectService.create({
                projectId: data.projectId,
                roleId: data.roleId,
                userId: user.user_id,
                isActive: true
            })
        }

    }

    async token(token: string) {
        const decoded: any = this.jwtService.verify(token, JwtEncodables.REFRESH_TOKEN)
        const doesExist = await this.userService.findOne({ user_id: decoded.userId })
        if (!doesExist.is_active) throw this.serviceException.throw('RESOURCE_CONFLICT', 'user not active')

        const encodeBody = { userId: decoded.userId, role: decoded.role, username: decoded.username }
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),
        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: doesExist.user_id })
        return { username: doesExist.username, access_token, refresh_token }
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userService.findOne({ email: email });
        if (!user) this.serviceException.throw('NOT_FOUND', 'user not found for this email')
        await this.mailService.sendResetPasswordLink({
            email,
            name: user.first_name,
            resetLink: `localhost:${process.env.PORT}/auth/reset-password`
        });
    }
    async resetPassword(model: ForgetPasswordDto): Promise<void> {
        const { email, newPassword } = model;
        const user = this.userService.findOne({ email });
        if (!user) this.serviceException.throw('NOT_FOUND', 'user not found!');
        this.userSecurityService.sendOtp({ email, resend: false });
        const newHasedPwd = await hashFn(newPassword)
        this.userService.update({ email }, { password_hash: newHasedPwd });
    }
}
