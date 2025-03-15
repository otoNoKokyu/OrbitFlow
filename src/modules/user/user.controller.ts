import { Body, Controller, Get, HttpCode, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { TAppUser } from 'src/utility/utility.type';
import { EditTEntityUser } from './types/user.types';

@Controller('user')
export class UserController {
    constructor(private _userService:UserService){}

    @Get('/me')
    async  me (
        @Req() { user }: { user: TAppUser }
    )
    {
        return await this._userService.getUserMeData(user.userId)
    }
    @Put('/editProfile')
    @HttpCode(200)
    public async editUserProfile(@Body() user: EditTEntityUser) {
       return await this._userService.editUserProfile(user);
    }
}
