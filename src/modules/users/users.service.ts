import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { Algorithm, hash } from '@node-rs/argon2';
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

      const hashedPassword = await hash(createUserDto.password, {
        algorithm: Algorithm.Argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });

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
      where: { email: email },
    });
  }

  async findUserById(id: string) {
    return await this._userRepo.findOne({
      where: { id: id },
    });
  }
}
