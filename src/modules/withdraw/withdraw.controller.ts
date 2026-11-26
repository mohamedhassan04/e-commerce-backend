import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WithdrawQueryDto } from './dto/withdraw-query.dto';
import { WithdrawService } from './withdraw.service';

@ApiTags('Withdraw')
@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @ApiOperation({ summary: 'Submit a withdrawal from contract request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Withdrawal request submitted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Order not delivered yet or withdrawal period expired.',
  })
  @Post()
  create(@Body() createWithdrawDto: CreateWithdrawDto) {
    return this.withdrawService.create(createWithdrawDto);
  }

  @ApiOperation({ summary: 'Get all withdrawal requests (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Withdrawal requests retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query() query: WithdrawQueryDto) {
    return this.withdrawService.findAll(query);
  }
}
