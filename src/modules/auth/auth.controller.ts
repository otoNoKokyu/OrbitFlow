import { Controller,HttpCode, Query, Req } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { SignInDto } from './dto/signin.dto'
import { Body, Post, } from '@nestjs/common';
import { EligbleInviteRole } from 'src/modules/role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { UUID } from 'crypto';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { User } from '../user/model/User.model';
import { UserProjectService } from '../project/userProject.service';

@Controller('auth')
export class AuthController {
    constructor(
        private usersService: UserService,
        private useProjectService: UserProjectService,
        private authService: AuthService,
    ) { }

    @Post('/signin')
    @HttpCode(200)
    private async signIn(
        @Body() credentials: SignInDto,
    ) {
        return await this.authService.signIn(credentials)
    }
    @Post('/signUp')
    @HttpCode(201)
    private async signUp(
        @Body() data: ModelCreationAttributes<User> & {projectId:string}
    ) {
        const user = await this.authService.signUp(data)
        return user
    }
    @Post('/sendOtp')
    @HttpCode(200)
    public async sendOtp(
        @Body() { resend, email }: { resend: boolean, email: string }
    ) {
        return await this.authService.sendOtp({ resend, email })
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
        @Query() { roleId, pId }: { roleId: UUID, pId: string },
        @Req() { user, body: { email } }: ExpressRequest & { user: any },
    ) {
        return await this.usersService.invite({ roleId, pId, email, username: user.username, userId: user.userId })
    }
    @Post('/verify')
    @HttpCode(200)
    private async handleOtp(
        @Body() { email, otp }: { email: string, otp: number }
    ) {
        return await this.authService.verify({ email, otp })
    }

}

