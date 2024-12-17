import { Body, Controller, Get, HttpCode, Patch, Put, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '../auth/dto/signup.dto';
import { Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { RoleEnum } from '../role/utility/roles.enum';

@Controller('user')
export class UserController {
    constructor(private _userService: UserService){}
    @Get('/me')
    public async me(@Req() { user }: Request & { user: any },) {
        const me = this._userService.findOneById(user.userId)
        return me;
    }
    @Put('/editProfile')
    @HttpCode(200)
    public async editUserProfile(@Body() user: UserDTO) {
        await this._userService.editUserProfile(user);
    }
    @Patch('/update-email')
    @Role([RoleEnum.ADMIN])
    public async updateUserEmail(@Body() body: {email: string, userId: string}, @Res() res : Response) {
        const isValid = await this._userService.validateEmailUpdate({email: body.email});
        // if(isValid) res.redirect(302, '/auth/sendOtp');
        await this._userService.updateUserEmail(body);
    }
}
