import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_NOT_FOUND = 'User not found';

@Injectable()
export class UserService {
  private BCRYPT_SALT_ROUNDS = 12;

  public constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findAll() {
    const res = await this.repository.find();
    return { data: res };
  }

  async findOne(id: string): Promise<User> {
    return await this.getUserOrError(id);
  }

  public async getUserByEmail(email: string) {
    const user = await this.repository
      .createQueryBuilder()
      .where('User.email = :email', { email: email })
      .addSelect('User.password')
      .getOne();

    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND);
    }

    return user;
  }

  public async createUser(userDto: CreateUserDto): Promise<CreateUserDto> {
    await this.checkIfUserEmailNotExistOrError(userDto.email);

    if (userDto.password !== userDto.passwordConfirmation) {
      throw new BadRequestException(
        'Password and password confirmation does not match',
      );
    }
    userDto.password = await bcrypt.hash(
      userDto.password,
      this.BCRYPT_SALT_ROUNDS,
    );

    await this.repository.save(userDto);

    return {
      ...userDto,
      password: undefined,
      passwordConfirmation: undefined,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user: User = await this.getUserOrError(id);

    if (!!updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (!!updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (!!updateUserDto.middleName) {
      user.middleName = updateUserDto.middleName;
    }
    if (!!updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.password && updateUserDto.passwordConfirmation) {
      if (updateUserDto.password !== updateUserDto.passwordConfirmation) {
        throw new BadRequestException(
          'password and password confirmation does not match',
        );
      }
      user.password = await bcrypt.hash(
        updateUserDto.password,
        this.BCRYPT_SALT_ROUNDS,
      );
    }
    if (!!updateUserDto.isActive) {
      user.isActive = updateUserDto.isActive;
    }
    if (!!updateUserDto.role) {
      user.role = updateUserDto.role;
    }
    if (!!updateUserDto.description) {
      user.description = updateUserDto.description;
    }

    return this.repository.save(user);
  }

  async softDelete(id: string) {
    const user: User = await this.getUserOrError(id);
    await this.repository.softDelete(user.id);
  }

  async getUserOrError(id: string): Promise<User> {
    const user: User = await this.repository.findOneBy({ id: id });
    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND);
    }
    return user;
  }

  private async checkIfUserEmailNotExistOrError(email: string): Promise<void> {
    const existingUser = await this.repository
      .createQueryBuilder()
      .where('User.email = :email', { email: email })
      .getOne();
    if (existingUser) {
      throw new BadRequestException('User email address has already in use');
    }
  }

  public async hashUserPassword(
    password: string,
    passwordConfirmation: string,
  ): Promise<string> {
    if (password !== passwordConfirmation) {
      throw new BadRequestException(
        'Password and password confirmation does not match',
      );
    }
    return bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.repository
      .createQueryBuilder()
      .where('User.id = :userId', { userId: userId })
      .addSelect('User.refreshToken')
      .getOne();

    if (!user?.refreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(
      refreshToken,
      this.BCRYPT_SALT_ROUNDS,
    );
    await this.repository.update(userId, {
      refreshToken: currentHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    await this.repository.update(userId, {
      refreshToken: null,
    });
  }
}
