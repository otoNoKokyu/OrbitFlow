import { Controller, Get, Query, Req } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request as ExpressRequest } from 'express';
import { SignInDto } from './dto/signin.dto'
import { UserDTO } from './dto/signup.dto'
import * as jwt from 'jsonwebtoken';
import { comparePwd, hashFn } from './helper/bcrypt';
import { Body, ConflictException, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';
import { EligbleInviteRole, RoleEnum } from 'src/modules/role/utility/roles.enum';
import { ProjectService } from 'src/modules/project/project.service';
import { MailService } from 'src/utility/mail/mail.service';
import { Role } from 'src/decorators/role.decorator';
import { RedisService } from 'src/utility/redis/redis.service';

@Controller('auth')
export class AuthController {
    constructor(private usersService: UserService, private mailService: MailService,
        private projectService: ProjectService, private redisSerice: RedisService) {}

    @Post('/signin')
    private async signIn(
        @Body() credentials: SignInDto,
    ) {
        const { email, password } = credentials
        const userExist = await this.usersService.findByCredential({ email });
        if (!userExist) throw new UnauthorizedException('user not found')
        const { password_hash, role, user_id } = userExist
        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) throw new UnauthorizedException('password does not match')
        const access_token = await jwt.sign(
            {
                username: userExist.username, userId: user_id, role: role.role
            },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );
        const refresh_token = await jwt.sign({ username: userExist.username, userId: user_id, role: role.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await this.usersService.updateUserTokens(access_token, refresh_token, userExist.user_id)
        return { access_token, refresh_token }
    }

    @Post('/signUp')
    private async signUp(
        @Body() data: UserDTO,
    ) {
        const { username, email, phone_number, first_name, assigned_role, projectId } = data
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
            const otp = Math.floor(10000 + Math.random() * 90000)
            await this.redisSerice.setTempData({ ...userData, assigned_role, projectId,otp })
            this.mailService.sendOtp(email, otp)
        } catch (err) {
            throw err
        }
        return { expiresIn: 160 }

    }

    @Post('/token')
    private async token(
        @Body('token') token: string
    ) {
        const isRefreshTokenValid = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        if (!isRefreshTokenValid) throw new UnauthorizedException('token expired.Please signin again')
        const userInfo: any = jwt.decode(token)
        const doesExist = await this.usersService.findOne(userInfo.userId)
        if (!doesExist.is_active) throw new ConflictException('user not active')
        const access_token = await jwt.sign(
            {
                username: userInfo.username, userId: userInfo.userId, role: userInfo.role
            },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );
        const refresh_token = await jwt.sign(
            {
                username: userInfo.username, userId: userInfo.userId, role: userInfo.role
            },
            process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await this.usersService.updateUserTokens(access_token, refresh_token, doesExist.user_id)
        return { access_token, refresh_token }
    }
    @Post('/invite')
    @Role(EligbleInviteRole.Inviter)
    private async invite(
        @Query() { pId }: { role: string, pId: string },
        @Req() { user }: ExpressRequest & { user: any },
    ) {
        const project = await this.projectService.findProjectById(pId)
        if (!project) throw new ConflictException('no project found')

        this.mailService.sendEmail(user.username, project.name)
        return 'invitation sent'
    }
    @Get('/me')
    private async me(
        @Req() { user }: ExpressRequest & { user: any },
    ) {
        const me = this.usersService.findOneById(user.userId)
        return me

    }
    @Post('/handleOtp')
    private async handleOtp(
        @Query() { type }: { type: 'verify' | 'resend' },
        @Body() { email, otp }: { email: string, otp: number }
    ) {
        const tempUserData = await this.redisSerice.getTempData(email)

        if (type === 'resend') {
            const resendOtp = Math.floor(10000 + Math.random() * 90000)
            const expiresIn = 160
            await this.redisSerice.setTempData({ ...tempUserData, otp: resendOtp })
            this.mailService.sendOtp(email, resendOtp)
            return { expiresIn }
        }
        else {
            if (!tempUserData) throw new ConflictException('otp expired')
            if (otp !== tempUserData?.otp) return 'otp mismatched'
            const { assigned_role, projectId } = tempUserData
            await this.usersService.createUser(tempUserData, { assigned_role, projectId })
            this.redisSerice.dropTempData(email)
            return 'user registered'
        }
    }

}

