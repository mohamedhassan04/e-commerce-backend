import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response as Res } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    private usersService: UsersService,
  ) {}

  //@Method POST
  //@desc Login user
  //@Path: /login
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User Logged Successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User Logged Failed.',
  })
  @ApiBody({ type: LoginUserDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res: Res) {
    try {
      const { accessToken } = await this.authService.login(req.user);

      return res.status(200).json({
        success: {
          access_token: accessToken,
        },
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred during login',
        error: error.message,
      });
    }
  }

  //@Method POST
  //@desc Register a new user
  //@Path: /register
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.register(createUserDto);
  }

  //@Method GET
  //@desc Get Current User
  //@Path: /current
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Current User Successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Current User Failed.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Get('current')
  async current(@Request() req: any) {
    const refresh_token = req.cookies['refresh_token'];
    const user = req?.user;
    return {
      status: HttpStatus.OK,
      success: {
        refresh_token,
        user,
      },
    };
  }

  //@Method POST
  //@desc Logout from my account
  //@Path: /logout
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Logout User Successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Logout User Failed.',
  })
  @Post('logout')
  async logout(@Response() res: Res) {
    res.clearCookie('refresh_token');
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Se déconnecter avec success',
    });
  }
}
