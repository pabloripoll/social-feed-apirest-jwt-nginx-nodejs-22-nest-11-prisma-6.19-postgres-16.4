import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {

    @Get()
    @HttpCode(HttpStatus.OK)
    root() {
        return {
            status: HttpStatus.OK,
            path: '/'
        };
    }

    @Get('api')
    @HttpCode(HttpStatus.OK)
    api() {
        return {
            status: HttpStatus.OK,
            path: '/api'
        };
    }

    @Get('api/v1')
    @HttpCode(HttpStatus.OK)
    apiV1() {
        return {
            status: HttpStatus.OK,
            path: '/api/v1'
        };
    }
}
