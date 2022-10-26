import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../../core/config';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private appConfigService: AppConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new HttpException({ User: 'not found' }, HttpStatus.UNAUTHORIZED);
    }

    const is_valid_password = await bcrypt.compare(password, user.password);
    if (is_valid_password) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    return {
      accessToken: this.getAccessToken(user),
      refreshToken: await this.getRefreshToken(user),
      user: user,
    };
  }

  async refresh(user: User) {
    return {
      accessToken: this.getAccessToken(user),
    };
  }

  private getAccessToken(user: User): string {
    const payload = { ...user };
    return this.jwtService.sign(payload);
  }

  private async getRefreshToken(user: User): Promise<string> {
    const payload = { ...user };

    const token = this.jwtService.sign(payload, {
      secret: this.appConfigService.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: this.appConfigService.JWT_REFRESH_TOKEN_EXPIRATION,
    });

    await this.userService.setCurrentRefreshToken(token, user.id);

    return token;
  }

  async removeRefreshToken(userId: string) {
    await this.userService.removeRefreshToken(userId);
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload: { userId: string } = this.jwtService.verify(token, {
      secret: this.appConfigService.JWT_ACCESS_TOKEN_SECRET,
    });
    if (payload.userId) {
      return this.userService.findOne(payload.userId);
    }
  }
}
