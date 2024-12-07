import { Controller, Get, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request as ExpressRequest } from 'express';
import { SignInDto } from './dto/signin.dto'
import { UserDTO } from './dto/signup.dto'
import { comparePwd, hashFn } from './helper/bcrypt';
import { Body, ConflictException, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';
import { EligbleInviteRole, RoleEnum } from 'src/modules/role/utility/roles.enum';
import { ProjectService } from 'src/modules/project/project.service';
import { MailService } from 'src/utility/mail/mail.service';
import { Role } from 'src/decorators/role.decorator';
import { RedisService } from 'src/utility/redis/redis.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

@Controller('auth')
export class AuthController {
    constructor(private usersService: UserService, private mailService: MailService,
        private projectService: ProjectService, private redisSerice: RedisService, private jwtService: JwtService) { }

    @Post('/signin')
    private async signIn(
        @Body() credentials: SignInDto,
    ) {
        const { email, password } = credentials
        const userExist = await this.usersService.findByCredential({ email });

        if (!userExist) throw new ConflictException('user not found')
        const { password_hash, role, user_id } = userExist

        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) throw new UnauthorizedException('password does not match')

        const encodeBody = { username: userExist.username, userId: user_id, role: role.role }
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
            this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),

        ])
        await this.usersService.updateUserTokens(access_token, refresh_token, userExist.user_id)
        return { access_token, refresh_token }
    }

    @Post('/signUp')
    @HttpCode(200) 
    private async signUp(
        @Body() data: UserDTO
    ) {
        const { username, email, phone_number, first_name, projectId, assigned_role } = data
        const userExist = await this.usersService.findDuplicateUser({
            username,
            email,
            phone_number,
            first_name,
        });
        if (userExist) throw new ConflictException('user already exists')
        const hasedPwd = await hashFn(data.password_hash);
        const userData = {
            ...data,
            password_hash: hasedPwd,
            date_of_birth: new Date(data.date_of_birth)
        }
        try {
            const otpMeta = await this.sendOtp({
                user: userData,
                email: userData.email,
                resend: false
            })
            return { email, username, expiresIn: otpMeta.expiresIn };
        } catch (err) {
            throw err
        }
    }

    @Post('/sendOtp')
    @HttpCode(200) 
    public async sendOtp(
        @Body() { resend, user, email }: { resend: boolean, user?: UserDTO, email: string }
    ) {
        const resendOtp = Math.floor(10000 + Math.random() * 90000)
        const newDate = new Date(new Date().getTime() + 2 * 60 * 1000);
        const newUnixTime = Math.floor(newDate.getTime() / 1000);
        if (resend) {
            const doesExist = await this.redisSerice.getTempData(email)
            if (!doesExist) throw new ConflictException('profile not found')
            await this.redisSerice.setTempData(email, { ...doesExist, otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        } else await this.redisSerice.setTempData(user.email, { ...user, otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        this.mailService.sendOtp(email, resendOtp)
        return { expiresIn: newUnixTime }
    }
    @Post('/token')
    @HttpCode(200) 
    private async token(
        @Body('token') token: string
    ) {
        try {
            const decoded: any = this.jwtService.verify(token, JwtEncodables.REFRESH_TOKEN)
            const doesExist = await this.usersService.findOne(decoded.userId)
            if (!doesExist.is_active) throw new ConflictException('user not active')
            const encodeBody = { username: decoded.username, userId: decoded.userId, role: decoded.role }
            const [access_token, refresh_token] = await Promise.all([
                this.jwtService.sign(encodeBody, JwtEncodables.ACCESS_TOKEN),
                this.jwtService.sign(encodeBody, JwtEncodables.REFRESH_TOKEN),
            ])
            await this.usersService.updateUserTokens(access_token, refresh_token, doesExist.user_id)
            return { access_token, refresh_token }
        } catch (err) {
            throw new UnauthorizedException(err)
        }
    }
    @Post('/invite')
    @HttpCode(200)
    @Role(EligbleInviteRole.Inviter)
    private async invite(
        @Query() { role, pId }: { role: string, pId: string },
        @Req() { user, body:{email} }: ExpressRequest & { user: any },
    ) {
        const project = await this.projectService.findProjectById(pId)
        if (!project) throw new ConflictException('no project found')
        const encodeBody = {
            projectId: pId,
            assigned_role: role,
            inviterId: user.userId
        }
        const secretInvitationId = await this.jwtService.sign(encodeBody, JwtEncodables.INVITE)
        this.mailService.sendEmail(user.username, project.name, email, secretInvitationId)
        return 'invitation sent'
    }
    @Get('/me')
    private async me(
        @Req() { user }: ExpressRequest & { user: any },
    ) {
        const me = this.usersService.findOneById(user.userId)
        return me
    }
    @Post('/verify')
    private async handleOtp(
        @Body() { email, otp }: { email: string, otp: number }
    ) {
        const tempUserData = await this.redisSerice.getTempData(email)
        if (!tempUserData) throw new ConflictException('data not found')

        const currentUnixTime = Math.floor(Date.now() / 1000)
        if (Math.abs(currentUnixTime - tempUserData.otpExpiresAt) > 300) throw new ConflictException('otp expired')

        if (otp !== tempUserData?.otp) throw new ConflictException('otp mismatched')

        const { assigned_role, projectId } = tempUserData
        console.log(tempUserData)

        if (assigned_role && projectId) await this.usersService.createUser(tempUserData, { assigned_role, projectId })
        else await this.usersService.createUser(tempUserData)
        return 'user registered'
    }
}

