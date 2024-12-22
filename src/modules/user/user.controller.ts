import { BadRequestException, Body, ConflictException, Controller, Get, HttpCode, NotFoundException, Patch, Put, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '../auth/dto/signup.dto';
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
    @Role([RoleEnum.ADMIN])
    public async editUserProfile(@Body() user: UserDTO) {
        try {
            await this._userService.editUserProfile(user);
            return 'user updated successfully';
        }catch(err) {
            if (err.message === 'user with same email already exists!') 
                throw new NotFoundException(err.message);
            if(err.message === 'user not found!') 
                throw new NotFoundException(err.message);
            throw new BadRequestException('Invalid data!');
        }
    }
}
