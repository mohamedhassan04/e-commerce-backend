import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { PhoneNumber } from './entities/phone-number.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly _userRepo: Repository<Users>,
    private readonly dataSource: DataSource,
  ) {}

  // @desc Register a new user
  // @route POST /users/register
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

  // @desc Get a user by email
  // @route GET /users/get-user-by-email
  async findOneUser(email: string) {
    return await this._userRepo.findOne({
      where: { email },
      relations: ['addresses', 'phoneNumbers'],
    });
  }

  // @desc Get a user by ID
  // @route GET /users/:id
  async findUserById(id: string) {
    return await this._userRepo.findOne({
      where: { id: id },
      relations: ['addresses', 'phoneNumbers'],
    });
  }

  // @desc Add addresses to connected user
  // @route PUT /users/addresses
  async addAddresses(userId: string, addresses: CreateAddressDto[]) {
    const user = await this._userRepo.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });
    if (!user) {
      throw new ConflictException('Utilisateur non trouvé.');
    }

    const addressEntities = addresses.map((addr) =>
      this.dataSource.manager.create(Address, {
        ...addr,
        user,
      }),
    );

    await this.dataSource.manager.save(addressEntities);

    return {
      message: 'Adresses ajoutées avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Update an address of connected user
  // @route PATCH /users/addresses/:addressId
  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.dataSource.manager.findOne(Address, {
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) {
      throw new NotFoundException('Adresse non trouvée.');
    }

    Object.assign(address, dto);
    await this.dataSource.manager.save(address);

    return {
      message: 'Adresse mise à jour avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Add phone numbers to connected user
  // @route PUT /users/phone-numbers
  async addPhoneNumbers(userId: string, phoneNumbers: CreatePhoneNumberDto[]) {
    const user = await this._userRepo.findOne({
      where: { id: userId },
      relations: ['phoneNumbers'],
    });
    if (!user) {
      throw new ConflictException('Utilisateur non trouvé.');
    }

    const phoneEntities = phoneNumbers.map((phone) =>
      this.dataSource.manager.create(PhoneNumber, {
        ...phone,
        user,
      }),
    );

    await this.dataSource.manager.save(phoneEntities);

    return {
      message: 'Numéros de téléphone ajoutés avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Update a phone number of connected user
  // @route PATCH /users/phone-numbers/:phoneId
  async updatePhoneNumber(userId: string, phoneId: string, dto: UpdatePhoneNumberDto) {
    const phone = await this.dataSource.manager.findOne(PhoneNumber, {
      where: { id: phoneId, user: { id: userId } },
    });
    if (!phone) {
      throw new NotFoundException('Numéro de téléphone non trouvé.');
    }

    Object.assign(phone, dto);
    await this.dataSource.manager.save(phone);

    return {
      message: 'Numéro de téléphone mis à jour avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
