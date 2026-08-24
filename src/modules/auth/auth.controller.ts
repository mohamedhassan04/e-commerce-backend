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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response as Res } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  //@Method POST
  //@desc Login user
  //@Path: /login
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User Logged Successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  @ApiBody({ type: LoginUserDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Body() loginUserDto: LoginUserDto,
    @Response() res: Res,
  ) {
    try {
      const { accessToken } = await this.authService.login(
        req.user,
        loginUserDto,
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: this.configService.get<number>('JWT_EXPIRATION_MS', 3600000),
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful',
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
  //@desc Get current authenticated user
  //@Path: /current
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current User Successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('current')
  async current(@Request() req: any) {
    return {
      status: HttpStatus.OK,
      success: {
        user: req.user,
      },
    };
  }

  //@Method POST
  //@desc Logout user and clear cookie
  //@Path: /logout
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout User Successfully.',
  })
  @Post('logout')
  async logout(@Response() res: Res) {
    res.clearCookie('access_token');
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
