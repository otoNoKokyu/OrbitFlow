import { Controller, Get, HttpCode, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Body, Post, } from '@nestjs/common';
import { EligbleInviteRole } from 'src/modules/role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { User } from '../user/model/User.model';
import { UserSecurityService } from 'src/utility/user-security/user-security.service';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { Throttle } from '@nestjs/throttler';
import { ForgetPasswordSchema, SignInSchema, userSchema } from './validator/auth.validator';
import { TForgetPassword, TInvite, TSendOtp, TSignIn } from './types/auth.types';
import { TAppUser } from 'src/utility/utility.type';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private usersService: UserService,
        private authService: AuthService,
        private userSecurityService: UserSecurityService,
    ) { }

    @Post('/signin')
    @UsePipes(new JoiValidationPipe(SignInSchema))
    @HttpCode(200)
    private async signIn(
        @Body() credentials: TSignIn,
    ) {
        return await this.authService.signIn(credentials)
    }
    @Post('/signUp')
    @UsePipes(new JoiValidationPipe(userSchema))
    @HttpCode(201)
    private async signUp(
        @Body() data: ModelCreationAttributes<User> & { projectId: string }
    ) {
        const user = await this.authService.signUp(data)
        return user
    }
    @Post('/sendOtp')
    @HttpCode(200)
    public async sendOtp(
        @Body() { resend, email }: TSendOtp
    ) {
        return await this.userSecurityService.sendOtp({ resend, email })
    }
    @Post('/token')
    @HttpCode(200)
    private async token(
        @Body('token') token: string
    ) {
        return await this.authService.token(token)
    }
    @Post('/invite')
    @HttpCode(200)
    @Role(EligbleInviteRole.Inviter)
    private async invite(
        @Req() { user, body, query }: { user: TAppUser; body: TInvite, query: { pId: string, roleId: string } },
    ) {
        const { email } = body
        const { pId, roleId } = query
        const { username, userId } = user
        return await this.usersService.invite({ roleId, pId, email, username, userId })
    }
    @Post('/verify')
    @HttpCode(200)
    private async handleOtp(
        @Body() { email, otp }: { email: string, otp: number }
    ) {
        return await this.userSecurityService.verify({ email, otp })
    }

    @Post('/forget-password')
    @HttpCode(200)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    private async forgetPassword(
        @Body('email') email: string
    ) {
        return await this.authService.forgotPassword(email)
    }
    @Get('/forgotPassword')
    async handleForgotPassword(@Query('hash') hash: string, @Res() res: Response) {

        const shouldRenderForgotPasswordPage = await this.authService.verifyForgotPasswordLink(hash)
        return res.render('forgotPassword',  { message: 'Reset link sent to your email!', token: hash, expired:!shouldRenderForgotPasswordPage});
    }    

    @Post('/reset-password')
    @HttpCode(200)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UsePipes(new JoiValidationPipe(ForgetPasswordSchema))
    private async resetPassword(
        @Body() body: TForgetPassword,
        @Res() res: Response
    ) {
         await this.authService.resetPassword(body)
         return res.redirect('http://localhost:5173/login')

    }
    @Get('/getInvitedEmail')
    @HttpCode(200)
    private async getInvitedEmail(
        @Query() { token }: { token: string }
    ) {
        return await this.authService.getInvitedUserEmail(token)
    }

}

