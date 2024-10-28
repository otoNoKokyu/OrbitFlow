import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {

    @Get('')
    private hello(){
        return 'how are you'
    }
}
