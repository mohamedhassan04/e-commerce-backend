import { Controller, Get, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get One User' })
  @Get('get-user-by-email')
  findOne(@Body() email: string) {
    return this.usersService.findOneUser(email);
  }
}
