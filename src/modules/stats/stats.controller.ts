import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { StatsService } from './stats.service';
import { StatsQueryDto } from './dto/stats-query.dto';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly _statsService: StatsService) {}

  @ApiOperation({ summary: 'Get dashboard overview stats (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('dashboard')
  getDashboardStats(@Query() query: StatsQueryDto) {
    return this._statsService.getDashboardStats(query.range);
  }
}
