import { Controller, Get, Query, Req } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request as ExpressRequest } from 'express';
import { SignInDto } from './dto/signin.dto'
import { UserDTO } from './dto/signup.dto'
import * as jwt from 'jsonwebtoken';
import { comparePwd, hashFn } from './helper/bcrypt';
import { Body, ConflictException, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EligbleInviteRole } from 'src/role/utility/roles.enum';
import { ProjectService } from 'src/project/project.service';
const fs = require('fs');
const path = require('path');
@Controller('auth')
export class AuthController {
    constructor(private usersService: UserService, private mailService:MailerService, private projectService:ProjectService) { }

    @Post('/signin')
    private async signIn(
        @Body() credentials: SignInDto,
    ) {
        const { username, password } = credentials
        const userExist = await this.usersService.findByCredential({ username });
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
        const refreshToken = await jwt.sign({ username: userExist.username, userId: user_id, role: role.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await this.usersService.updateUserTokens(access_token, refreshToken, userExist.user_id)
        return { access_token, refreshToken }
    }
    @Post('/signUp')
    private async signUp(
        @Body() data: UserDTO,
    ) {
        const { username, email, phone_number, first_name, assigned_role } = data
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
        await this.usersService.createUser(userData, assigned_role)
        return 'user registered'



    }

    @Post('/token')
    private async token(
        @Body('token') token: string
    ) {
        const isRefreshTokenValid = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        if (!isRefreshTokenValid) throw new UnauthorizedException('token expired.Please signin again')
        const userInfo:  any = jwt.decode(token)
        const doesExist = await this.usersService.findOne(userInfo.userId)
        if(!doesExist.is_active) throw new ConflictException('user not active')
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
    private async invite(
        @Query() {role,pId}: {role:string,pId:string},
        @Req() {user}: ExpressRequest & {user:any},
    ) {
        if(user.role !== EligbleInviteRole.Inviter) throw new ConflictException('action cannot be performed')
        const project = await this.projectService.findProjectById(pId)
        if(!project) throw new ConflictException('no project found')
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../assets/email/template.html'), 'utf-8');
        const htmlContent = htmlTemplate
        .replace('<placeholder1>', user.username)
        .replace('<placeholder2>', project.name);

        this.mailService.sendMail({
          from: 'OrbitFlow<Orbitflow@test.com>',
          to: 'arko466@gmail.com',
          subject: `Collaboration Invitation on OrbitFlow`,
          html: htmlContent
        });
        return 'invitation sent'
      }
    }

