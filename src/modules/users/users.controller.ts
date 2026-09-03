import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AddAddressesDto } from './dto/add-addresses.dto';
import { AddPhoneNumbersDto } from './dto/add-phone-numbers.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { Users } from './entities/user.entity';
import { UserQueryDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //@Method GET
  //@desc Get all users for admin (only USER role)
  //@Path: /users/admin/all
  @ApiOperation({ summary: 'Get all users for admin (USER role only)' })
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllUsersForAdmin(@Query() query: UserQueryDto) {
    return this.usersService.getAllUsersForAdmin(query);
  }

  //@Method GET
  //@desc Get a user by email
  //@Path: /users/get-user-by-email
  @ApiOperation({ summary: 'Get One User' })
  @Get('get-user-by-email')
  findOne(@Body() email: string) {
    return this.usersService.findOneUser(email);
  }

  //@Method PUT
  //@desc Add addresses to connected user
  //@Path: /users/addresses
  @ApiOperation({ summary: 'Add addresses to user' })
  @Put('addresses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  addAddresses(@Body() dto: AddAddressesDto, @GetUser() user: Users) {
    return this.usersService.addAddresses(user.id, dto.addresses);
  }

  //@Method PATCH
  //@desc Update an address of connected user
  //@Path: /users/addresses/:addressId
  @ApiOperation({ summary: 'Update address of user' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @Patch('addresses/:addressId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  updateAddress(
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
    @GetUser() user: Users,
  ) {
    return this.usersService.updateAddress(user.id, addressId, dto);
  }

  //@Method PUT
  //@desc Add phone numbers to connected user
  //@Path: /users/phone-numbers
  @ApiOperation({ summary: 'Add phone numbers to user' })
  @Put('phone-numbers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  addPhoneNumbers(@Body() dto: AddPhoneNumbersDto, @GetUser() user: Users) {
    return this.usersService.addPhoneNumbers(user.id, dto.phoneNumbers);
  }

  //@Method PATCH
  //@desc Update a phone number of connected user
  //@Path: /users/phone-numbers/:phoneId
  @ApiOperation({ summary: 'Update phone number of user' })
  @ApiParam({ name: 'phoneId', description: 'Phone Number ID' })
  @Patch('phone-numbers/:phoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  updatePhoneNumber(
    @Param('phoneId') phoneId: string,
    @Body() dto: UpdatePhoneNumberDto,
    @GetUser() user: Users,
  ) {
    return this.usersService.updatePhoneNumber(user.id, phoneId, dto);
  }

  //@Method POST
  //@desc Verify account with verification code
  //@Path: /users/verify-account
  @ApiOperation({ summary: 'Verify account with verification code' })
  @Post('verify-account')
  async verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.usersService.verifyAccount(dto.email, dto.verificationCode);
  }

  //@Method POST
  //@desc Send forgot password code to email
  //@Path: /users/forgot-password
  @ApiOperation({ summary: 'Send forgot password code' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto.email);
  }

  //@Method POST
  //@desc Reset password with code
  //@Path: /users/reset-password
  @ApiOperation({ summary: 'Reset password with code' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(
      dto.email,
      dto.resetCode,
      dto.newPassword,
    );
  }

  //@Method PATCH
  //@desc Change password for connected user
  //@Path: /users/change-password
  @ApiOperation({ summary: 'Change password for connected user' })
  @Patch('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  changePassword(@Body() dto: ChangePasswordDto, @GetUser() user: Users) {
    return this.usersService.changePassword(user.id, dto.oldPassword, dto.newPassword);
  }
}
