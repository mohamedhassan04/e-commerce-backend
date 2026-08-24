import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly _userRepo: Repository<Users>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this._userRepo.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Cette adresse email est deja utilisée.');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      const user = this._userRepo.create({
        ...createUserDto,
        password: hashedPassword,
      });

      await this._userRepo.save(user);

      return {
        message: 'Compte créé avec succés.',
        HttpStatus: HttpStatus.CREATED,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOneUser(email: string) {
    return await this._userRepo.findOne({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return await this._userRepo.findOne({
      where: { id: id },
    });
  }
}
