import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Users } from '../users/entities/user.entity';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneUser(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Users, loginUserDto: LoginUserDto) {
    const payload = {
      sub: { id: user.id, email: loginUserDto.email },
      username: user.firstName + ' ' + user.lastName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
