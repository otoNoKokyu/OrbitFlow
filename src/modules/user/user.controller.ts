import { Body, Controller, Get, HttpCode, Put, Req, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { TAppUser } from 'src/utility/utility.type';
import { EditTEntityUser } from './types/user.types';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { EditProfileSchema } from './validator/user.validator';

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
    @UsePipes(new JoiValidationPipe(EditProfileSchema))
    @HttpCode(200)
    public async editUserProfile(
        @Body() body: EditTEntityUser,
        @Req() user: TAppUser
    ) {
       return await this._userService.update({user_id:user.userId},body);
    }
}
