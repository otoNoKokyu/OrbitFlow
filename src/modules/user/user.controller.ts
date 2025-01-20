import { Body, Controller, Get, HttpCode, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit.user.profile.dto';

@Controller('user')
export class UserController {
    constructor(private _userService:UserService){}

    @Get('')
    private hello(){
        return 'how are you'
    }

    @Get('/me')
    private me (
        @Req() { user }: { user: any },

    )
    {
        return this._userService.getUserMeData(user.userId)
    }
    @Put('/editProfile')
    @HttpCode(200)
    public async editUserProfile(@Body() user: EditUserDto) {
       return await this._userService.editUserProfile(user);
    }
}
