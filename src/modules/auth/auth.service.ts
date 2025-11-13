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
import { RoleService } from '../role/role.service';
import { RoleEnum } from '../role/utility/roles.enum';
import { TForgetPassword } from './types/auth.types';
import { UserRepository } from '../user/user.repository';
import { Roles } from '../role/model/roles.model';
import { isEmptyObject } from 'src/utility/NullishUtills';
@Injectable()
export class AuthService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
        private userService: UserService,
        private jwtService: JwtService,
        // private redisService: RedisService,
        @Inject('UserRedisService') private readonly redisService: RedisService,
        @Inject('FpRedisService') private readonly fpRedisService: RedisService,
        private mailService: MailService,
        private userProjectService: UserProjectService,
        private userSecurityService: UserSecurityService,
        private roleService: RoleService,
        private userRepository: UserRepository,
    ) {
    }
    async signIn(data: { email: string, password: string }) {
        const { email, password } = data
        const userExist = await this.userRepository.findOne(
            { email },
            [
                {
                    model: Roles,
                    attributes: ['role']
                }
            ]
        );
        if (!userExist) this.serviceException.throw('RESOURCE_CONFLICT', 'user not found')
        const { password_hash, user_id, role } = userExist

        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) this.serviceException.throw('RESOURCE_CONFLICT', 'password does not match')

        const encodeBody = { userId: user_id, username: userExist.username, role: role.role, roleId: userExist.roleId }

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),

        ])
        await this.userService.update({ access_token, refresh_token }, { user_id: user_id })
        return { username: userExist.username, access_token, refresh_token }
    }
    async signUp(data: ModelCreationAttributes<User> & { projectId: string }) {
        const { username, email, phone_number, first_name, invited_by } = data
        const filter = {
            username,
            email,
            phone_number,
            first_name,
        }
        if (invited_by) filter['invited_by'] = invited_by
        const userExist = await this.userService.findOne(filter);
        if (userExist) this.serviceException.throw('RESOURCE_CONFLICT', 'user already exists')
        const hasedPwd = await hashFn(data.password_hash);
        data.password_hash = hasedPwd

        if (data.projectId) {
            const invitedRoleId = data.roleId
            const user = await this.userService.create(data)
            delete data.roleId
            await this.userProjectService.create({
                projectId: data.projectId,
                roleId: invitedRoleId,
                userId: user.user_id,
                isActive: true
            })
            return user;
        }
        const { role_id } = await this.roleService.findOne({ role: RoleEnum.ADMIN })
        const user = await this.userService.create({ ...data, roleId: role_id })
        return user


    }
    async token(token: string) {
        try {
            const decoded = this.jwtService.verify(token, JwtEncodables.REFRESH_TOKEN)
            const doesExist = await this.userService.findOne({ user_id: decoded.userId })
            if (!doesExist?.is_active) throw this.serviceException.throw('RESOURCE_CONFLICT', 'user not active')

            const encodeBody = { userId: decoded.userId, role: decoded.role, username: decoded.username, roleId: decoded.roleI }
            const [access_token, refresh_token] = await Promise.all([
                this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
                this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),
            ])
            await this.userService.update({ access_token, refresh_token }, { user_id: doesExist.user_id })
            return { username: doesExist.username, access_token, refresh_token }
        } catch (err) {
            console.log(err)
        }

    }
    async forgotPassword(email: string): Promise<void> {
        const user = await this.userService.findOne({ email: email });
        if (!user) this.serviceException.throw('NOT_FOUND', 'user not found for this email')
        const shortLivedHash = await this.jwtService.sign({ userId: user.user_id }, JwtEncodables.RESET_PASSWORD)
        await this.fpRedisService.setTempData(user.user_id,shortLivedHash,900)
        await this.mailService.sendResetPasswordLink({
            email,
            name: user.first_name,
            resetLink: `http://localhost:3000/auth/forgotPassword?hash=${shortLivedHash}`
        });
    }
    async verifyForgotPasswordLink(hash: string) {
        try{
            const {userId} = await this.jwtService.verify(hash,JwtEncodables.RESET_PASSWORD)
            const data  = await this.fpRedisService.getTempData(userId)
            if(isEmptyObject(data)) return false;
            return true
        }catch(error){
            console.error(error)
            return false
        }

    }
    async resetPassword(model: TForgetPassword): Promise<void> {
        const { token, password } = model;
        const verifiedToken = await this.jwtService.verify(token,JwtEncodables.RESET_PASSWORD)
        const {userId} = verifiedToken
        const user = await this.userService.findOne({ user_id:userId });
        if (!user) this.serviceException.throw('NOT_FOUND', 'user not found!');
        const newHasedPwd = await hashFn(password)
        await this.userService.update({ user_id: user.user_id }, { password_hash: newHasedPwd });
        await this.fpRedisService.dropTempData(userId)
    }
    async getInvitedUserEmail(encodedInviteToken: string) {
        const decodedToken = await this.jwtService.verify(encodedInviteToken, JwtEncodables.INVITE)
        return { email: decodedToken.email }
    }
}
