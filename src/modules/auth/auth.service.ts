import { Injectable } from '@nestjs/common';
import { verify } from '@node-rs/argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Users } from '../users/entities/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* Validate user credentials */
  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneUser(email);
    if (user && (await verify(user.password, password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /* Login function */
  async login(user: Users) {
    const payload = {
      username: user.firstName + ' ' + user.lastName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
