import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('api/v1/health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get('db')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Check database connectivity' })
    @ApiResponse({ status: 200, description: 'Database connectivity status' })
    async checkDatabaseConnection() {
        return this.healthService.checkDatabaseConnection();
    }
}
