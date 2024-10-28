import { Controller, Get } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/model/User.model';
import { SignInDto } from './dto/signin.dto'
import { UserDTO } from './dto/signup.dto'
import * as jwt from 'jsonwebtoken';
import { comparePwd, hashFn } from './helper/bcrypt';
import { Body, ConflictException, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    constructor(private usersService: UserService) { }

    @Post('/signin')
    private async signIn(
        @Body() credentials: SignInDto,
    ) {
        const { username, password } = credentials
        const userExist = await this.usersService.findByCredential({ username });
        if (!userExist) throw new UnauthorizedException('user not found')
        const { password_hash } = userExist
        const isPwdValid = await comparePwd(password_hash, password)
        if (!isPwdValid) throw new UnauthorizedException('password does not match')
        const token = jwt.sign(
                    { 
                        username: userExist.username, userId: userExist.user_id
                    },
                        process.env.JWT_SECRET, { expiresIn: '1h' }
                    );
        const refreshToken = jwt.sign({ username: userExist.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await this.usersService.updateUserTokens(token,refreshToken,userExist.user_id)
        return { token, refreshToken }
    }
    @Post('/signUp')
    private async signUp(
        @Body() data: UserDTO,
    ) {
        const { username, email, phone_number, first_name } = data
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
            password_hash: hasedPwd
        }
        await this.usersService.createUser({...userData, date_of_birth: new Date(userData.date_of_birth)})
        return 'user registered'



    }

}
