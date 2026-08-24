import { Controller, Get, Post, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Add user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Add User Successfully.',
  })
  @Post('add-user')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Get One User' })
  @Get('get-user-by-email')
  findOne(@Body() email: string) {
    return this.usersService.findOneUser(email);
  }
}
