import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @Get('')
    private hello(){
        return 'how are you'
    }

    @Get('/me')
    private me (
        @Req() { user }: { user: any },

    )
    {
        return this.userService.getUserMeData(user.userId)
    }
}
