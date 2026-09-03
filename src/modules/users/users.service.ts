import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { generateResetCode } from 'src/shared/utils/utils';
import { EmailService } from 'src/shared/send-mail/mail.service';
import { UserQueryDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly _userRepo: Repository<Users>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
  ) {}

  // @desc Register a new user
  // @route POST /auth/register
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

      const verificationCode = generateResetCode(10);
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 30);

      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = expiry;
      await this._userRepo.save(user);

      await this.emailService.sendEmailCreateUserAccount(
        createUserDto.email,
        verificationCode,
      );

      return {
        message:
          'Compte créé avec succés. Un email de vérification a été envoyé.',
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
  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
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
  async updatePhoneNumber(
    userId: string,
    phoneId: string,
    dto: UpdatePhoneNumberDto,
  ) {
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

  // @desc Verify account with verification code
  // @route POST /users/verify-account
  async verifyAccount(email: string, verificationCode: string) {
    const user = await this._userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    if (user.isVerified) {
      throw new BadRequestException('Ce compte est déjà vérifié.');
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
      throw new BadRequestException(
        'Aucun code de vérification trouvé. Veuillez demander un nouveau code.',
      );
    }

    if (user.verificationCode !== verificationCode) {
      throw new BadRequestException('Code de vérification invalide.');
    }

    if (new Date() > user.verificationCodeExpiry) {
      throw new BadRequestException(
        'Le code de vérification a expiré. Veuillez demander un nouveau code.',
      );
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await this._userRepo.save(user);

    return {
      message: 'Compte vérifié avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Send forgot password code
  // @route POST /users/forgot-password
  async forgotPassword(email: string) {
    const user = await this._userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        'Aucun compte associé à cette adresse email.',
      );
    }

    const resetCode = generateResetCode(10);
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 30);

    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiry = expiry;
    await this._userRepo.save(user);

    await this.emailService.sendEmailForgotPassword(email, resetCode);

    return {
      message: 'Code de réinitialisation envoyé avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Reset password with code
  // @route POST /users/reset-password
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    const user = await this._userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    if (!user.resetPasswordCode || !user.resetPasswordCodeExpiry) {
      throw new BadRequestException(
        "Aucun code de réinitialisation trouvé. Veuillez d'abord demander la réinitialisation.",
      );
    }

    if (user.resetPasswordCode !== resetCode) {
      throw new BadRequestException('Code de réinitialisation invalide.');
    }

    if (new Date() > user.resetPasswordCodeExpiry) {
      throw new BadRequestException(
        'Le code de réinitialisation a expiré. Veuillez demander un nouveau code.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiry = null;
    await this._userRepo.save(user);

    return {
      message: 'Mot de passe réinitialisé avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Change password for connected user
  // @route PATCH /users/change-password
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this._userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Ancien mot de passe incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await this._userRepo.save(user);

    return {
      message: 'Mot de passe changé avec succés.',
      HttpStatus: HttpStatus.OK,
    };
  }

  // @desc Get all users for admin (only USER role) with filters and pagination
  // @route GET /users/admin/all
  async getAllUsersForAdmin(query: UserQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.isActive',
        'user.isVerified',
        'user.createdAt',
      ])
      .where('user.role = :role', { role: 'USER' });

    if (query.email) {
      qb.andWhere('LOWER(user.email) LIKE :email', {
        email: `%${query.email.toLowerCase()}%`,
      });
    }

    if (query.fullName) {
      qb.andWhere(
        "LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :fullName",
        { fullName: `%${query.fullName.toLowerCase()}%` },
      );
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
